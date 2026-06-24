/*
 * @Description: 审批流程配置服务层
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Service = require('egg').Service;

class OaApprovalFlowService extends Service {

  /**
   * 查询审批流程配置列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaApprovalFlowList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaApprovalFlowMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaApprovalFlowListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询审批流程配置详情
   * @param {Number} flowId - 流程ID
   * @return {object} 审批流程配置信息
   */
  async selectOaApprovalFlowByFlowId(flowId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaApprovalFlowMapper.selectOaApprovalFlowByFlowId([],{flowId});
  }

  /**
   * 新增审批流程配置
   * @param {object} data - 审批流程配置信息
   * @return {object} 新增结果
   */
  async insertOaApprovalFlow(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalFlowMapper.insertOaApprovalFlow([],data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改审批流程配置
   * @param {object} data - 审批流程配置信息
   * @return {object} 修改结果
   */
  async updateOaApprovalFlow(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalFlowMapper.updateOaApprovalFlow([],data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除审批流程配置
   * @param {array} flowIds - 流程ID数组
   * @return {object} 删除结果
   */
  async deleteOaApprovalFlowByFlowIds(flowIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalFlowMapper.deleteOaApprovalFlowByFlowIds([],{array:flowIds});

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaApprovalFlowService;
