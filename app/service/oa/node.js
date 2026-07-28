/*
 * @Description: 审批节点配置服务层（通用节点池模式）
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 * @Update: 2026-07-28 改为通用节点池，移除 flow_id 和 node_order
 */

const Service = require('egg').Service;

class OaApprovalNodeService extends Service {

  /**
   * 查询审批节点列表（通用节点池）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaApprovalNodeList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaApprovalNodeMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaApprovalNodeListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询审批节点详情
   * @param {Number} nodeId - 节点ID
   * @return {object} 审批节点配置信息
   */
  async selectOaApprovalNodeByNodeId(nodeId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaApprovalNodeMapper.selectOaApprovalNodeByNodeId([],{nodeId});
  }

  /**
   * 新增审批节点
   * @param {object} data - 审批节点配置信息
   * @return {object} 新增结果
   */
  async insertOaApprovalNode(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalNodeMapper.insertOaApprovalNode([],data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改审批节点
   * @param {object} data - 审批节点配置信息
   * @return {object} 修改结果
   */
  async updateOaApprovalNode(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalNodeMapper.updateOaApprovalNode([],data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除审批节点
   * @param {array} nodeIds - 节点ID数组
   * @return {object} 删除结果
   */
  async deleteOaApprovalNodeByNodeIds(nodeIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalNodeMapper.deleteOaApprovalNodeByNodeIds([],{array:nodeIds});

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaApprovalNodeService;
