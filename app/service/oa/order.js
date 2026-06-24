/*
 * @Description: 采购订单服务层
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Service = require('egg').Service;

class OaPurchaseOrderService extends Service {

  /**
   * 查询采购订单列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaPurchaseOrderList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaPurchaseOrderMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaPurchaseOrderListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询采购订单详情
   * @param {Number} orderId - 订单ID
   * @return {object} 采购订单信息
   */
  async selectOaPurchaseOrderByOrderId(orderId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaPurchaseOrderMapper.selectOaPurchaseOrderByOrderId([],{orderId});
  }

  /**
   * 新增采购订单
   * @param {object} data - 采购订单信息
   * @return {object} 新增结果
   */
  async insertOaPurchaseOrder(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseOrderMapper.insertOaPurchaseOrder([],data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改采购订单
   * @param {object} data - 采购订单信息
   * @return {object} 修改结果
   */
  async updateOaPurchaseOrder(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseOrderMapper.updateOaPurchaseOrder([],data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除采购订单
   * @param {array} orderIds - 订单ID数组
   * @return {object} 删除结果
   */
  async deleteOaPurchaseOrderByOrderIds(orderIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseOrderMapper.deleteOaPurchaseOrderByOrderIds([],{array:orderIds});

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaPurchaseOrderService;
