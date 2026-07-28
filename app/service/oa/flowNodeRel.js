/*
 * @Description: 流程-节点关联服务层
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Service = require('egg').Service;

class OaFlowNodeRelService extends Service {

  /**
   * 查询流程-节点关联列表
   * @param {object} params - 查询参数（flowId / nodeId）
   * @return {object} 查询结果
   */
  async selectOaFlowNodeRelList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaFlowNodeRelMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaFlowNodeRelList([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 按流程ID查询关联的节点详情（含节点在该流程中的顺序）
   * @param {Number} flowId - 流程ID
   * @return {array} 节点列表
   */
  async selectNodesByFlowId(flowId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaFlowNodeRelMapper.selectNodesByFlowId([], { flowId });
  }

  /**
   * 查询关联详情
   * @param {Number} relId - 关联ID
   * @return {object} 关联信息
   */
  async selectOaFlowNodeRelByRelId(relId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaFlowNodeRelMapper.selectOaFlowNodeRelByRelId([], { relId });
  }

  /**
   * 新增关联
   * @param {object} data - 关联信息
   * @return {object} 新增结果
   */
  async insertOaFlowNodeRel(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaFlowNodeRelMapper.insertOaFlowNodeRel([], data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 批量新增关联
   * @param {array} list - 关联列表 [{flowId, nodeId, nodeOrder, createBy}]
   * @return {object} 新增结果
   */
  async batchInsertOaFlowNodeRel(list) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaFlowNodeRelMapper.batchInsertOaFlowNodeRel([], { array: list });

    return { code: 200, msg: '批量新增成功', data: result };
  }

  /**
   * 修改关联
   * @param {object} data - 关联信息
   * @return {object} 修改结果
   */
  async updateOaFlowNodeRel(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaFlowNodeRelMapper.updateOaFlowNodeRel([], data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 按流程ID删除所有关联（重新配置流程节点时先清空旧关联）
   * @param {Number} flowId - 流程ID
   * @return {object} 删除结果
   */
  async deleteOaFlowNodeRelByFlowId(flowId) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaFlowNodeRelMapper.deleteOaFlowNodeRelByFlowId([], { flowId });

    return { code: 200, msg: '删除成功', data: result };
  }

  /**
   * 删除关联
   * @param {array} relIds - 关联ID数组
   * @return {object} 删除结果
   */
  async deleteOaFlowNodeRelByRelIds(relIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaFlowNodeRelMapper.deleteOaFlowNodeRelByRelIds([], { array: relIds });

    return { code: 200, msg: '删除成功', data: result };
  }

  /**
   * 配置流程节点（先删旧关联，再批量写入新关联）
   * @param {Number} flowId - 流程ID
   * @param {array} nodes - 节点列表 [{nodeId, nodeOrder}]
   * @param {string} createBy - 创建人
   * @return {object} 配置结果
   */
  async configFlowNodes(flowId, nodes, createBy) {
    const { ctx } = this;
    const db = ctx.helper.getMasterDB(ctx);

    // 1. 先删除该流程的所有旧关联
    await db.oaFlowNodeRelMapper.deleteOaFlowNodeRelByFlowId([], { flowId });

    // 2. 如果有节点，批量写入新关联
    if (nodes && nodes.length > 0) {
      const list = nodes.map(item => ({
        flowId,
        nodeId: item.nodeId,
        nodeOrder: item.nodeOrder,
        createBy,
      }));
      await db.oaFlowNodeRelMapper.batchInsertOaFlowNodeRel([], { array: list });
    }

    return { code: 200, msg: '流程节点配置成功' };
  }
}

module.exports = OaFlowNodeRelService;
