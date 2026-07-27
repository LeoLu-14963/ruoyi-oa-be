/*
 * @Description: 物料样品评估服务层
 * @Author: 愚者
 * @Date: 2026-07-27
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
}

module.exports = OaSampleEvaluationService;
