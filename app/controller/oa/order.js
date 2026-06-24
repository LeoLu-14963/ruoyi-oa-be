/*
 * @Description: 采购订单控制器
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/order')
  class OaPurchaseOrderController extends Controller {

    /**
     * 查询采购订单列表
     * GET /oa/order/list
     * 权限：oa:order:list
     */
    @RequiresPermissions('oa:order:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.order.selectOaPurchaseOrderList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询采购订单列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询采购订单列表失败'
        };
      }
    }

    /**
     * 查询采购订单详情
     * GET /oa/order/:orderId
     * 权限：oa:order:query
     */
    @RequiresPermissions('oa:order:query')
    @HttpGet('/:orderId')
    async getInfo() {
      const { ctx } = this;
      const { orderId } = ctx.params;

      const result = await ctx.service.oa.order.selectOaPurchaseOrderByOrderId(orderId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增采购订单
     * POST /oa/order
     * 权限：oa:order:add
     */
    @RequiresPermissions('oa:order:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.order.insertOaPurchaseOrder(data);

      ctx.body = result;
    }

    /**
     * 修改采购订单
     * PUT /oa/order
     * 权限：oa:order:edit
     */
    @RequiresPermissions('oa:order:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.order.updateOaPurchaseOrder(data);

      ctx.body = result;
    }

    /**
     * 删除采购订单
     * DELETE /oa/order/:orderIds
     * 权限：oa:order:remove
     */
    @RequiresPermissions('oa:order:remove')
    @HttpDelete('/:orderIds')
    async remove() {
      const { ctx } = this;
      const { orderIds } = ctx.params;

      const orderIdArray = orderIds.split(',');
      const result = await ctx.service.oa.order.deleteOaPurchaseOrderByOrderIds(orderIdArray);

      ctx.body = result;
    }

    /**
     * 导出采购订单
     * POST /oa/order/export
     * 权限：oa:order:export
     */
    @Log({ title: '采购订单', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:order:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询采购订单列表
        const result = await service.oa.order.selectOaPurchaseOrderList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '订单号', key: 'orderCode', width: 20 },
          { header: '关联采购申请ID', key: 'purchaseId', width: 20 },
          { header: '供应商ID', key: 'supplierId', width: 20 },
          { header: '订单日期', key: 'orderDate', width: 20 },
          { header: '交货日期', key: 'deliveryDate', width: 20 },
          { header: '订单总金额', key: 'totalAmount', width: 20 },
          { header: '付款方式', key: 'paymentMethod', width: 20 },
          { header: '付款条件', key: 'paymentTerms', width: 20 },
          { header: '送货地址', key: 'deliveryAddress', width: 20 },
          { header: '状态(0待确认1已确认2已发货3已收货4已取消)', key: 'status', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '采购订单数据');
      } catch (err) {
        ctx.logger.error('导出采购订单失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出采购订单失败'
        };
      }
    }
  }

  return OaPurchaseOrderController;
};
