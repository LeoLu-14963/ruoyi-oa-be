/*
 * @Description: 供应商管理控制器
 * @Author: 姜彦汐
 * @Date: 2026-06-20
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/supplier')
  class OaSupplierController extends Controller {

    /**
     * 查询供应商管理列表
     * GET /oa/supplier/list
     * 权限：oa:supplier:list
     */
    @RequiresPermissions('oa:supplier:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.supplier.selectOaSupplierList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询供应商管理列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询供应商管理列表失败'
        };
      }
    }

    /**
     * 查询供应商管理详情
     * GET /oa/supplier/:supplierId
     * 权限：oa:supplier:query
     */
    @RequiresPermissions('oa:supplier:query')
    @HttpGet('/:supplierId')
    async getInfo() {
      const { ctx } = this;
      const { supplierId } = ctx.params;

      const result = await ctx.service.oa.supplier.selectOaSupplierBySupplierId(supplierId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增供应商管理
     * POST /oa/supplier
     * 权限：oa:supplier:add
     */
    @RequiresPermissions('oa:supplier:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      try {
        const data = ctx.request.body;

        // 添加创建人信息
        data.createBy = ctx.state.user.userName;

        const result = await ctx.service.oa.supplier.insertOaSupplier(data);

        ctx.body = result;
      } catch (err) {
        ctx.logger.error('新增供应商管理失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '新增供应商管理失败',
        };
      }
    }

    /**
     * 修改供应商管理
     * PUT /oa/supplier
     * 权限：oa:supplier:edit
     */
    @RequiresPermissions('oa:supplier:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      try {
        const data = ctx.request.body;

        // 添加更新人信息
        data.updateBy = ctx.state.user.userName;

        const result = await ctx.service.oa.supplier.updateOaSupplier(data);

        ctx.body = result;
      } catch (err) {
        ctx.logger.error('修改供应商管理失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '修改供应商管理失败',
        };
      }
    }

    /**
     * 删除供应商管理
     * DELETE /oa/supplier/:supplierIds
     * 权限：oa:supplier:remove
     */
    @RequiresPermissions('oa:supplier:remove')
    @HttpDelete('/:supplierIds')
    async remove() {
      const { ctx } = this;
      try {
        const { supplierIds } = ctx.params;

        const supplierIdArray = supplierIds.split(',');
        const result = await ctx.service.oa.supplier.deleteOaSupplierBySupplierIds(supplierIdArray);

        ctx.body = result;
      } catch (err) {
        ctx.logger.error('删除供应商管理失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '删除供应商管理失败',
        };
      }
    }

    /**
     * 导出供应商管理
     * POST /oa/supplier/export
     * 权限：oa:supplier:export
     */
    @Log({ title: '供应商管理', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:supplier:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询供应商管理列表
        const result = await service.oa.supplier.selectOaSupplierList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '供应商编码', key: 'supplierCode', width: 20 },
          { header: '供应商名称', key: 'supplierName', width: 20 },
          { header: '供应商类型', key: 'supplierType', width: 20 },
          { header: '联系人', key: 'contactName', width: 20 },
          { header: '联系电话', key: 'contactPhone', width: 20 },
          { header: '联系邮箱', key: 'contactEmail', width: 20 },
          { header: '地址', key: 'address', width: 20 },
          { header: '统一社会信用代码', key: 'creditCode', width: 20 },
          { header: '开户银行', key: 'bankName', width: 20 },
          { header: '银行账号', key: 'bankAccount', width: 20 },
          { header: '状态(0正常1停用)', key: 'status', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '供应商管理数据');
      } catch (err) {
        ctx.logger.error('导出供应商管理失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出供应商管理失败'
        };
      }
    }
  }

  return OaSupplierController;
};
