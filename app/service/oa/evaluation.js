/*
 * @Description: 物料样品评估服务层
 * @Author: 愚者
 * @Date: 2026-07-27
 * @Update: 2026-07-30 修复编辑时明细丢失；明细更新改为先删后插并加日志
 */

const Service = require('egg').Service;

class OaSampleEvaluationService extends Service {

  async selectOaSampleEvaluationList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaSampleEvaluationMapper;
    return await ctx.helper.pageQuery(
      mapper.selectOaSampleEvaluationListMapper([], params),
      params,
      mapper.db()
    );
  }

  async selectOaSampleEvaluationByEvaluationId(evaluationId) {
    const { ctx } = this;
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    const details = await ctx.helper.getDB(ctx).oaSampleEvaluationDetailMapper.selectOaSampleEvaluationDetailList([], { evaluationId });
    return { ...evaluation, details: details || [] };
  }

  /**
   * 新增评估（同时写入统一申请索引表）
   */
  async insertOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    // 1. 写业务表
    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.insertOaSampleEvaluation([], evaluation);

    // 2. 写统一申请索引
    await ctx.service.oa.application.createApplication({
      typeCode: 'SAMPLE_EVALUATION',
      businessId: result,
      title: evaluation.title,
      applicantId: ctx.state.user.userId,
      applicantName: ctx.state.user.userName,
      deptId: ctx.state.user.deptId,
      deptName: ctx.state.user.deptName,
      status: evaluation.status || '0',
      createBy: evaluation.createBy,
    });

    // 3. 写明细
    if (details && details.length > 0) {
      for (const detail of details) {
        detail.evaluationId = result;
        detail.createBy = evaluation.createBy;
        await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.insertOaSampleEvaluationDetail([], detail);
      }
    }

    return { code: 200, msg: '新增成功', data: result };
  }

  async updateOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    ctx.logger.info('[updateOaSampleEvaluation] 入参 evaluationId=%s, details=%j', evaluation.evaluationId, details);

    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], evaluation);

    if (details !== undefined) {
      const db = ctx.helper.getMasterDB(ctx);
      const evaluationId = evaluation.evaluationId;

      // 先删除旧明细
      const delResult = await db.oaSampleEvaluationDetailMapper.deleteOaSampleEvaluationDetailByEvaluationId([], { evaluationId });
      ctx.logger.info('[updateOaSampleEvaluation] 删除旧明细 evaluationId=%s, 影响行数=%s', evaluationId, delResult);

      if (details && details.length > 0) {
        for (const detail of details) {
          detail.evaluationId = evaluationId;
          detail.updateBy = evaluation.updateBy;
          if (!detail.detailId) {
            detail.createBy = evaluation.updateBy;
            const insertResult = await db.oaSampleEvaluationDetailMapper.insertOaSampleEvaluationDetail([], detail);
            ctx.logger.info('[updateOaSampleEvaluation] 插入明细 evaluationId=%s, result=%s, detail=%j', evaluationId, insertResult, detail);
          } else {
            // 保留 detailId 时尝试更新；不存在则插入
            const exists = await ctx.helper.getDB(ctx).oaSampleEvaluationDetailMapper.selectOaSampleEvaluationDetailByDetailId([], { detailId: detail.detailId });
            if (exists) {
              const updateResult = await db.oaSampleEvaluationDetailMapper.updateOaSampleEvaluationDetail([], detail);
              ctx.logger.info('[updateOaSampleEvaluation] 更新明细 detailId=%s, result=%s', detail.detailId, updateResult);
            } else {
              detail.createBy = evaluation.updateBy;
              const insertResult = await db.oaSampleEvaluationDetailMapper.insertOaSampleEvaluationDetail([], detail);
              ctx.logger.info('[updateOaSampleEvaluation] 插入明细（detailId不存在）evaluationId=%s, result=%s, detail=%j', evaluationId, insertResult, detail);
            }
          }
        }
      } else {
        ctx.logger.info('[updateOaSampleEvaluation] 无明细需要保存 evaluationId=%s', evaluationId);
      }
    }

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除评估（同时删除索引）
   */
  async deleteOaSampleEvaluationByEvaluationIds(evaluationIds) {
    const { ctx } = this;

    for (const evaluationId of evaluationIds) {
      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.deleteOaSampleEvaluationDetailByEvaluationId([], { evaluationId });
      // 删除统一索引
      await ctx.service.oa.application.deleteApplicationByTypeAndBusiness('SAMPLE_EVALUATION', evaluationId);
    }

    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.deleteOaSampleEvaluationByEvaluationIds([], { array: evaluationIds });
    return { code: 200, msg: '删除成功', data: result };
  }

  // ============================================================
  // 审批流转（走通用审批引擎）
  // ============================================================

  async submitEvaluation(evaluationId) {
    const { ctx } = this;

    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) return { code: 500, msg: '评估单不存在' };
    if (evaluation.status !== '0') return { code: 500, msg: `当前状态不允许提交审批（状态：${evaluation.status}）` };

    // 调通用审批引擎
    const result = await ctx.service.oa.approvalEngine.submit({
      typeCode: 'SAMPLE_EVALUATION',
      businessId: evaluationId,
      updateData: { evaluationId },
      updateFn: async (db, data) => {
        await db.oaSampleEvaluationMapper.updateOaSampleEvaluation([], data);
      },
    });

    // 同步统一申请索引
    if (result.code === 200) {
      const userName = ctx.state.user.userName;
      // 查当前节点信息（含审批人配置）
      const nodes = await ctx.service.oa.flowNodeRel.selectNodesByFlowId(
        (await ctx.service.oa.businessType.selectOaBusinessTypeByTypeCode('SAMPLE_EVALUATION')).flowId
      );
      const firstApprovalNode = nodes.find(n => n.nodeType === '1');
      // 从节点配置获取审批人
      const nextApprover = await ctx.service.oa.approvalEngine.getNextApprover(firstApprovalNode, ctx.state.user.userId);
      await ctx.service.oa.application.updateApplicationByTypeAndBusiness('SAMPLE_EVALUATION', evaluationId, {
        status: '2',
        currentNodeId: firstApprovalNode ? firstApprovalNode.nodeId : null,
        currentNodeName: firstApprovalNode ? firstApprovalNode.nodeName : null,
        currentApproverId: nextApprover.approverId,
        currentApproverName: nextApprover.approverName,
        submitTime: ctx.helper.formatDate(new Date()),
        updateBy: userName,
      });
    }

    return result;
  }

  async approveEvaluation(data) {
    const { ctx } = this;
    const { evaluationId, action, opinion, fields } = data;

    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) return { code: 500, msg: '评估单不存在' };
    if (evaluation.status !== '2') return { code: 500, msg: `当前状态不允许审批操作（状态：${evaluation.status}）` };

    const result = await ctx.service.oa.approvalEngine.approve({
      typeCode: 'SAMPLE_EVALUATION',
      businessId: evaluationId,
      action,
      opinion,
      fields,
      currentNodeId: evaluation.currentNodeId,
      updateFn: async (db, updateData) => {
        updateData.evaluationId = evaluationId;
        await db.oaSampleEvaluationMapper.updateOaSampleEvaluation([], updateData);
      },
    });

    // 同步统一申请索引
    if (result.code === 200) {
      const userName = ctx.state.user.userName;
      const updateData = { updateBy: userName };

      if (action === '2') {
        // 通过
        const config = await ctx.service.oa.businessType.selectOaBusinessTypeByTypeCode('SAMPLE_EVALUATION');
        const nodes = await ctx.service.oa.flowNodeRel.selectNodesByFlowId(config.flowId);
        const currentIdx = nodes.findIndex(n => String(n.nodeId) === String(evaluation.currentNodeId));
        const nextNode = nodes[currentIdx + 1];

        if (nextNode && nextNode.nodeType === '4') {
          updateData.status = '3'; // 已通过
          updateData.currentNodeId = null;
          updateData.currentNodeName = null;
          updateData.currentApproverId = null;
          updateData.currentApproverName = null;
          updateData.finishTime = ctx.helper.formatDate(new Date());
        } else {
          // 从下一节点配置获取审批人
          const nextApprover = await ctx.service.oa.approvalEngine.getNextApprover(nextNode, ctx.state.user.userId);
          updateData.status = '2';
          updateData.currentNodeId = nextNode ? nextNode.nodeId : null;
          updateData.currentNodeName = nextNode ? nextNode.nodeName : null;
          updateData.currentApproverId = nextApprover.approverId;
          updateData.currentApproverName = nextApprover.approverName;
        }
      } else if (action === '3') {
        // 驳回
        updateData.status = '4';
        updateData.currentNodeId = null;
        updateData.currentNodeName = null;
        updateData.currentApproverId = null;
        updateData.currentApproverName = null;
        updateData.finishTime = ctx.helper.formatDate(new Date());
      }

      await ctx.service.oa.application.updateApplicationByTypeAndBusiness('SAMPLE_EVALUATION', evaluationId, updateData);
    }

    return result;
  }

  async selectEvaluationApprovalRecords(evaluationId) {
    return await this.ctx.service.oa.approvalEngine.getRecords('SAMPLE_EVALUATION', evaluationId);
  }
}

module.exports = OaSampleEvaluationService;
