/*
 * @Description: 物料样品评估服务层
 * @Author: 愚者
 * @Date: 2026-07-27
 * @Update: 2026-07-28 适配节点池模式，审批节点查询改走关联表
 */

const Service = require('egg').Service;

class OaSampleEvaluationService extends Service {

  /**
   * 查询物料样品评估列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaSampleEvaluationList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaSampleEvaluationMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaSampleEvaluationListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询物料样品评估详情（含明细）
   * @param {Number} evaluationId - 评估ID
   * @return {object} 评估信息
   */
  async selectOaSampleEvaluationByEvaluationId(evaluationId) {
    const { ctx } = this;

    // 查询主表
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });

    // 查询明细
    const details = await ctx.helper.getDB(ctx).oaSampleEvaluationDetailMapper.selectOaSampleEvaluationDetailList([], { evaluationId });

    return {
      ...evaluation,
      details: details || []
    };
  }

  /**
   * 新增物料样品评估（含明细）
   * @param {object} data - 评估信息
   * @return {object} 新增结果
   */
  async insertOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    // 新增主表
    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.insertOaSampleEvaluation([], evaluation);

    // 新增明细
    if (details && details.length > 0) {
      for (const detail of details) {
        detail.evaluationId = result.insertId;
        detail.createBy = evaluation.createBy;
        await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.insertOaSampleEvaluationDetail([], detail);
      }
    }

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改物料样品评估（含明细）
   * @param {object} data - 评估信息
   * @return {object} 修改结果
   */
  async updateOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    // 更新主表
    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], evaluation);

    // 更新明细：先删后增
    if (details !== undefined) {
      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.deleteOaSampleEvaluationDetailByEvaluationId([], { evaluationId: evaluation.evaluationId });
      if (details && details.length > 0) {
        for (const detail of details) {
          detail.evaluationId = evaluation.evaluationId;
          detail.updateBy = evaluation.updateBy;
          if (!detail.detailId) {
            detail.createBy = evaluation.updateBy;
            await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.insertOaSampleEvaluationDetail([], detail);
          } else {
            await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.updateOaSampleEvaluationDetail([], detail);
          }
        }
      }
    }

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除物料样品评估（含明细）
   * @param {array} evaluationIds - 评估ID数组
   * @return {object} 删除结果
   */
  async deleteOaSampleEvaluationByEvaluationIds(evaluationIds) {
    const { ctx } = this;

    // 删除明细
    for (const evaluationId of evaluationIds) {
      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.deleteOaSampleEvaluationDetailByEvaluationId([], { evaluationId });
    }

    // 删除主表
    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.deleteOaSampleEvaluationByEvaluationIds([], { array: evaluationIds });

    return { code: 200, msg: '删除成功', data: result };
  }

  // ============================================================
  // 审批流转
  // ============================================================

  /**
   * 提交审批
   * 将草稿状态的评估单提交到审批流程，状态 0 -> 1(待审批) -> 2(审批中)
   * @param {Number} evaluationId - 评估ID
   * @return {object} 结果
   */
  async submitEvaluation(evaluationId) {
    const { ctx } = this;
    const userName = ctx.state.user.userName;
    const userId = ctx.state.user.userId;

    // 1. 查询评估单
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) {
      return { code: 500, msg: '评估单不存在' };
    }
    if (evaluation.status !== '0') {
      return { code: 500, msg: `当前状态不允许提交审批（状态：${evaluation.status}）` };
    }

    // 2. 查询审批流程（按 flow_type = SAMPLE_EVALUATION 找启用的流程）
    const flowList = await ctx.helper.getDB(ctx).oaApprovalFlowMapper.selectOaApprovalFlowList([], { flowType: 'SAMPLE_EVALUATION', status: '1' });
    const flows = Array.isArray(flowList) ? flowList : (flowList ? [flowList] : []);
    if (flows.length === 0) {
      return { code: 500, msg: '未找到启用的样品评估审批流程' };
    }
    const flow = flows[0];

    // 3. 通过关联表查询流程下的节点（按 node_order 排序）
    const allNodes = await ctx.service.oa.flowNodeRel.selectNodesByFlowId(flow.flowId);
    if (!allNodes || allNodes.length === 0) {
      return { code: 500, msg: '审批流程未配置节点' };
    }

    // allNodes 已按 node_order 升序排列
    // 找第一个审批节点（跳过发起节点 node_type=0 和结束节点 node_type=4）
    const firstApprovalNode = allNodes.find(n => n.nodeType === '1');
    if (!firstApprovalNode) {
      return { code: 500, msg: '审批流程未配置审批节点' };
    }

    // 4. 更新评估单状态
    await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], {
      evaluationId,
      status: '2', // 审批中
      currentNodeId: firstApprovalNode.nodeId,
      currentApproverId: userId,
      updateBy: userName,
    });

    // 5. 写入审批记录（提交动作）
    await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.insertOaApprovalRecord([], {
      businessId: evaluationId,
      businessType: 'SAMPLE_EVALUATION',
      nodeId: allNodes[0].nodeId, // 发起节点
      nodeName: allNodes[0].nodeName,
      approverId: userId,
      approverName: userName,
      action: '1', // 提交
      opinion: '提交审批',
      createBy: userName,
    });

    return { code: 200, msg: '提交审批成功' };
  }

  /**
   * 审批操作（通过/驳回）
   * @param {object} data - 审批数据
   * @param {Number} data.evaluationId - 评估ID
   * @param {string} data.action - 动作（2通过 3驳回）
   * @param {string} data.opinion - 审批意见
   * @param {object} data.fields - 各阶段专业字段（质检/工程/试用/结论）
   * @return {object} 结果
   */
  async approveEvaluation(data) {
    const { ctx } = this;
    const userName = ctx.state.user.userName;
    const userId = ctx.state.user.userId;
    const { evaluationId, action, opinion, fields } = data;

    // 1. 查询评估单
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) {
      return { code: 500, msg: '评估单不存在' };
    }
    if (evaluation.status !== '2') {
      return { code: 500, msg: `当前状态不允许审批操作（状态：${evaluation.status}）` };
    }

    // 2. 通过关联表反查当前节点所属的流程
    //    先查当前节点信息
    const currentNodeResult = await ctx.helper.getDB(ctx).oaApprovalNodeMapper.selectOaApprovalNodeByNodeId([], { nodeId: evaluation.currentNodeId });
    const currentNode = Array.isArray(currentNodeResult) ? currentNodeResult[0] : currentNodeResult;
    if (!currentNode) {
      return { code: 500, msg: '当前审批节点不存在' };
    }

    // 3. 查询评估单对应的审批流程（通过 flow_type 查找）
    const flowList = await ctx.helper.getDB(ctx).oaApprovalFlowMapper.selectOaApprovalFlowList([], { flowType: 'SAMPLE_EVALUATION', status: '1' });
    const flows = Array.isArray(flowList) ? flowList : (flowList ? [flowList] : []);
    if (flows.length === 0) {
      return { code: 500, msg: '审批流程不存在或已停用' };
    }
    const flowId = flows[0].flowId;

    // 4. 通过关联表查询流程下所有节点（已按 node_order 排序）
    const allNodes = await ctx.service.oa.flowNodeRel.selectNodesByFlowId(flowId);
    const sortedNodes = allNodes || [];
    const currentIdx = sortedNodes.findIndex(n => n.nodeId === evaluation.currentNodeId);

    // 5. 准备更新字段
    const updateData = {
      evaluationId,
      updateBy: userName,
    };

    // 6. 根据当前节点回填专业字段
    if (fields) {
      if (fields.inspectionResult !== undefined) updateData.inspectionResult = fields.inspectionResult;
      if (fields.inspectionTools !== undefined) updateData.inspectionTools = fields.inspectionTools;
      if (fields.inspectionStandard !== undefined) updateData.inspectionStandard = fields.inspectionStandard;
      if (fields.inspectionStatus !== undefined) updateData.inspectionStatus = fields.inspectionStatus;
      if (fields.engineeringEvaluation !== undefined) updateData.engineeringEvaluation = fields.engineeringEvaluation;
      if (fields.engineeringStatus !== undefined) updateData.engineeringStatus = fields.engineeringStatus;
      if (fields.trialUsage !== undefined) updateData.trialUsage = fields.trialUsage;
      if (fields.trialStatus !== undefined) updateData.trialStatus = fields.trialStatus;
      if (fields.finalConclusion !== undefined) updateData.finalConclusion = fields.finalConclusion;
      if (fields.conclusionRemark !== undefined) updateData.conclusionRemark = fields.conclusionRemark;
    }

    if (action === '2') {
      // ===== 通过 =====
      const nextIdx = currentIdx + 1;
      if (nextIdx >= sortedNodes.length) {
        return { code: 500, msg: '已是最后节点，无法继续' };
      }
      const nextNode = sortedNodes[nextIdx];

      if (nextNode.nodeType === '4') {
        // 下一节点是结束节点 -> 审批完成
        updateData.status = '3'; // 已通过
        updateData.currentNodeId = null;
        updateData.currentApproverId = null;
      } else {
        // 推进到下一审批节点
        updateData.status = '2'; // 审批中
        updateData.currentNodeId = nextNode.nodeId;
        updateData.currentApproverId = userId;
      }

      // 更新评估单
      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], updateData);

      // 写入审批记录
      await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.insertOaApprovalRecord([], {
        businessId: evaluationId,
        businessType: 'SAMPLE_EVALUATION',
        nodeId: evaluation.currentNodeId,
        nodeName: currentNode.nodeName,
        approverId: userId,
        approverName: userName,
        action: '2', // 通过
        opinion: opinion || '审批通过',
        createBy: userName,
      });

      return { code: 200, msg: nextNode.nodeType === '4' ? '审批完成，评估已通过' : `审批通过，下一节点：${nextNode.nodeName}` };

    } else if (action === '3') {
      // ===== 驳回 =====
      updateData.status = '4'; // 已驳回
      updateData.currentNodeId = null;
      updateData.currentApproverId = null;

      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], updateData);

      await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.insertOaApprovalRecord([], {
        businessId: evaluationId,
        businessType: 'SAMPLE_EVALUATION',
        nodeId: evaluation.currentNodeId,
        nodeName: currentNode.nodeName,
        approverId: userId,
        approverName: userName,
        action: '3', // 驳回
        opinion: opinion || '审批驳回',
        createBy: userName,
      });

      return { code: 200, msg: '已驳回' };

    } else {
      return { code: 500, msg: '不支持的操作类型，action 只能是 2(通过) 或 3(驳回)' };
    }
  }

  /**
   * 查询评估单的审批记录
   * @param {Number} evaluationId - 评估ID
   * @return {object} 审批记录列表
   */
  async selectEvaluationApprovalRecords(evaluationId) {
    const { ctx } = this;
    const records = await ctx.helper.getDB(ctx).oaApprovalRecordMapper.selectOaApprovalRecordList([], {
      businessId: evaluationId,
      businessType: 'SAMPLE_EVALUATION',
    });
    const recordList = Array.isArray(records) ? records : (records ? [records] : []);
    return { code: 200, msg: '查询成功', data: recordList };
  }
}

module.exports = OaSampleEvaluationService;
