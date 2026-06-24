/*
 * @Description: 供应商管理服务层
 * @Author: 姜彦汐
 * @Date: 2026-06-20
 */

const Service = require('egg').Service;

class OaSupplierService extends Service {

  /**
   * 查询供应商管理列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaSupplierList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaSupplierMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaSupplierListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询供应商管理详情
   * @param {Number} supplierId - 供应商ID
   * @return {object} 供应商管理信息
   */
  async selectOaSupplierBySupplierId(supplierId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaSupplierMapper.selectOaSupplierBySupplierId([], { supplierId });
  }

  /**
   * 新增供应商管理
   * @param {object} data - 供应商管理信息
   * @return {object} 新增结果
   */
  async insertOaSupplier(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaSupplierMapper.insertOaSupplier([], data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改供应商管理
   * @param {object} data - 供应商管理信息
   * @return {object} 修改结果
   */
  async updateOaSupplier(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaSupplierMapper.updateOaSupplier([], data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除供应商管理
   * @param {array} supplierIds - 供应商ID数组
   * @return {object} 删除结果
   */
  async deleteOaSupplierBySupplierIds(supplierIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaSupplierMapper.deleteOaSupplierBySupplierIds([], { array: supplierIds });

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaSupplierService;
