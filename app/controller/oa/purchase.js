/*
 * @Description: 采购申请单控制器
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/purchase')
  class OaPurchaseController extends Controller {

    /**
     * 查询采购申请单列表
     * GET /oa/purchase/list
     * 权限：oa:purchase:list
     */
    @RequiresPermissions('oa:purchase:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.purchase.selectOaPurchaseList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询采购申请单列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询采购申请单列表失败'
        };
      }
    }

    /**
     * 查询采购申请单详情
     * GET /oa/purchase/:purchaseId
     * 权限：oa:purchase:query
     */
    @RequiresPermissions('oa:purchase:query')
    @HttpGet('/:purchaseId')
    async getInfo() {
      const { ctx } = this;
      const { purchaseId } = ctx.params;

      const result = await ctx.service.oa.purchase.selectOaPurchaseByPurchaseId(purchaseId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增采购申请单
     * POST /oa/purchase
     * 权限：oa:purchase:add
     */
    @RequiresPermissions('oa:purchase:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.purchase.insertOaPurchase(data);

      ctx.body = result;
    }

    /**
     * 修改采购申请单
     * PUT /oa/purchase
     * 权限：oa:purchase:edit
     */
    @RequiresPermissions('oa:purchase:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.purchase.updateOaPurchase(data);

      ctx.body = result;
    }

    /**
     * 删除采购申请单
     * DELETE /oa/purchase/:purchaseIds
     * 权限：oa:purchase:remove
     */
    @RequiresPermissions('oa:purchase:remove')
    @HttpDelete('/:purchaseIds')
    async remove() {
      const { ctx } = this;
      const { purchaseIds } = ctx.params;

      const purchaseIdArray = purchaseIds.split(',');
      const result = await ctx.service.oa.purchase.deleteOaPurchaseByPurchaseIds(purchaseIdArray);

      ctx.body = result;
    }

    /**
     * 导出采购申请单
     * POST /oa/purchase/export
     * 权限：oa:purchase:export
     */
    @Log({ title: '采购申请单', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:purchase:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询采购申请单列表
        const result = await service.oa.purchase.selectOaPurchaseList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '采购单号', key: 'purchaseCode', width: 20 },
          { header: '申请标题', key: 'title', width: 20 },
          { header: '采购类型', key: 'purchaseType', width: 20 },
          { header: '申请部门ID', key: 'applyDeptId', width: 20 },
          { header: '申请人ID', key: 'applyUserId', width: 20 },
          { header: '申请时间', key: 'applyTime', width: 20 },
          { header: '紧急程度(0普通1紧急2特急)', key: 'urgency', width: 20 },
          { header: '需求日期', key: 'requiredDate', width: 20 },
          { header: '预估金额', key: 'estimatedAmount', width: 20 },
          { header: '申请理由', key: 'reason', width: 20 },
          { header: '附件地址', key: 'attachmentUrl', width: 20 },
          { header: '状态(0草稿1待审批2审批中3已通过4已驳回5已完成)', key: 'status', width: 20 },
          { header: '当前审批节点ID', key: 'currentNodeId', width: 20 },
          { header: '当前审批人ID', key: 'currentApproverId', width: 20 },
          { header: '流程实例ID', key: 'processInstanceId', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '采购申请单数据');
      } catch (err) {
        ctx.logger.error('导出采购申请单失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出采购申请单失败'
        };
      }
    }
  }

  return OaPurchaseController;
};
