/*
 * @Description: 物料样品评估服务层
 * @Author: 愚者
 * @Date: 2026-07-27
 * @Update: 2026-07-28 审批逻辑改走通用审批引擎
 */

const Service = require('egg').Service;

class OaSampleEvaluationService extends Service {

  /**
   * 查询物料样品评估列表（分页）
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
   */
  async selectOaSampleEvaluationByEvaluationId(evaluationId) {
    const { ctx } = this;

    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    const details = await ctx.helper.getDB(ctx).oaSampleEvaluationDetailMapper.selectOaSampleEvaluationDetailList([], { evaluationId });

    return {
      ...evaluation,
      details: details || []
    };
  }

  /**
   * 新增物料样品评估（含明细）
   */
  async insertOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.insertOaSampleEvaluation([], evaluation);

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
   */
  async updateOaSampleEvaluation(data) {
    const { ctx } = this;
    const { details, ...evaluation } = data;

    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.updateOaSampleEvaluation([], evaluation);

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
   */
  async deleteOaSampleEvaluationByEvaluationIds(evaluationIds) {
    const { ctx } = this;

    for (const evaluationId of evaluationIds) {
      await ctx.helper.getMasterDB(ctx).oaSampleEvaluationDetailMapper.deleteOaSampleEvaluationDetailByEvaluationId([], { evaluationId });
    }

    const result = await ctx.helper.getMasterDB(ctx).oaSampleEvaluationMapper.deleteOaSampleEvaluationByEvaluationIds([], { array: evaluationIds });
    return { code: 200, msg: '删除成功', data: result };
  }

  // ============================================================
  // 审批流转（走通用审批引擎）
  // ============================================================

  /**
   * 提交审批
   */
  async submitEvaluation(evaluationId) {
    const { ctx } = this;

    // 1. 查询评估单
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) {
      return { code: 500, msg: '评估单不存在' };
    }
    if (evaluation.status !== '0') {
      return { code: 500, msg: `当前状态不允许提交审批（状态：${evaluation.status}）` };
    }

    // 2. 调用通用审批引擎
    return await ctx.service.oa.approvalEngine.submit({
      typeCode: 'SAMPLE_EVALUATION',
      businessId: evaluationId,
      updateData: { evaluationId },
      updateFn: async (db, data) => {
        await db.oaSampleEvaluationMapper.updateOaSampleEvaluation([], data);
      },
    });
  }

  /**
   * 审批操作（通过/驳回）
   */
  async approveEvaluation(data) {
    const { ctx } = this;
    const { evaluationId, action, opinion, fields } = data;

    // 1. 查询评估单
    const evaluation = await ctx.helper.getDB(ctx).oaSampleEvaluationMapper.selectOaSampleEvaluationByEvaluationId([], { evaluationId });
    if (!evaluation) {
      return { code: 500, msg: '评估单不存在' };
    }
    if (evaluation.status !== '2') {
      return { code: 500, msg: `当前状态不允许审批操作（状态：${evaluation.status}）` };
    }

    // 2. 调用通用审批引擎
    return await ctx.service.oa.approvalEngine.approve({
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
  }

  /**
   * 查询评估单的审批记录
   */
  async selectEvaluationApprovalRecords(evaluationId) {
    return await this.ctx.service.oa.approvalEngine.getRecords('SAMPLE_EVALUATION', evaluationId);
  }
}

module.exports = OaSampleEvaluationService;
