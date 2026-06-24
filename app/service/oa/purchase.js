/*
 * @Description: 采购申请单服务层
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Service = require('egg').Service;

class OaPurchaseService extends Service {

  /**
   * 查询采购申请单列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaPurchaseList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaPurchaseMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaPurchaseListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询采购申请单详情
   * @param {Number} purchaseId - 采购申请ID
   * @return {object} 采购申请单信息
   */
  async selectOaPurchaseByPurchaseId(purchaseId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaPurchaseMapper.selectOaPurchaseByPurchaseId([],{purchaseId});
  }

  /**
   * 新增采购申请单
   * @param {object} data - 采购申请单信息
   * @return {object} 新增结果
   */
  async insertOaPurchase(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseMapper.insertOaPurchase([],data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改采购申请单
   * @param {object} data - 采购申请单信息
   * @return {object} 修改结果
   */
  async updateOaPurchase(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseMapper.updateOaPurchase([],data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除采购申请单
   * @param {array} purchaseIds - 采购申请ID数组
   * @return {object} 删除结果
   */
  async deleteOaPurchaseByPurchaseIds(purchaseIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaPurchaseMapper.deleteOaPurchaseByPurchaseIds([],{array:purchaseIds});

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaPurchaseService;
