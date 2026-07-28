/*
 * @Description: 统一申请服务层
 *   所有业务的申请统一写入 oa_application 索引表
 *   列表查询只查这一张表，支持按 typeCode 过滤
 *   审批引擎在 submit/approve 时自动同步索引表状态
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Service = require('egg').Service;

class OaApplicationService extends Service {

  /**
   * 查询统一申请列表（支持按 typeCode 过滤）
   */
  async selectOaApplicationList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaApplicationMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaApplicationListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询申请详情
   */
  async selectOaApplicationByApplicationId(applicationId) {
    const { ctx } = this;
    return await ctx.helper.getDB(ctx).oaApplicationMapper.selectOaApplicationByApplicationId([], { applicationId });
  }

  /**
   * 按业务类型+业务ID查询申请
   */
  async selectOaApplicationByTypeAndBusiness(typeCode, businessId) {
    const { ctx } = this;
    const result = await ctx.helper.getDB(ctx).oaApplicationMapper.selectOaApplicationByTypeAndBusiness([], { typeCode, businessId });
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * 创建申请索引（业务创建时调用）
   */
  async createApplication(data) {
    const { ctx } = this;
    return await ctx.helper.getMasterDB(ctx).oaApplicationMapper.insertOaApplication([], data);
  }

  /**
   * 更新申请索引（审批引擎 submit/approve 时调用）
   */
  async updateApplicationByTypeAndBusiness(typeCode, businessId, data) {
    const { ctx } = this;
    return await ctx.helper.getMasterDB(ctx).oaApplicationMapper.updateOaApplicationByTypeAndBusiness([], {
      typeCode,
      businessId,
      ...data,
    });
  }

  /**
   * 删除申请索引
   */
  async deleteApplicationByTypeAndBusiness(typeCode, businessId) {
    const { ctx } = this;
    return await ctx.helper.getMasterDB(ctx).oaApplicationMapper.deleteOaApplicationByTypeAndBusiness([], { typeCode, businessId });
  }
}

module.exports = OaApplicationService;
