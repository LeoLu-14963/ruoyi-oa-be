/*
 * @Description: 业务类型服务层
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Service = require('egg').Service;

class OaBusinessTypeService extends Service {

  /**
   * 查询业务类型列表
   */
  async selectOaBusinessTypeList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaBusinessTypeMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaBusinessTypeListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 按编码查询业务类型（含表单配置）
   */
  async selectOaBusinessTypeByTypeCode(typeCode) {
    const { ctx } = this;

    const result = await ctx.helper.getDB(ctx).oaBusinessTypeMapper.selectOaBusinessTypeByTypeCode([], { typeCode });
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * 查询业务类型详情
   */
  async selectOaBusinessTypeByTypeId(typeId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaBusinessTypeMapper.selectOaBusinessTypeByTypeId([], { typeId });
  }

  /**
   * 新增业务类型
   */
  async insertOaBusinessType(data) {
    const { ctx } = this;

    if (data.formConfig && typeof data.formConfig === 'object') {
      data.formConfig = JSON.stringify(data.formConfig);
    }

    const result = await ctx.helper.getMasterDB(ctx).oaBusinessTypeMapper.insertOaBusinessType([], data);
    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改业务类型（绑定流程 / 配置表单）
   */
  async updateOaBusinessType(data) {
    const { ctx } = this;

    if (data.formConfig && typeof data.formConfig === 'object') {
      data.formConfig = JSON.stringify(data.formConfig);
    }

    const result = await ctx.helper.getMasterDB(ctx).oaBusinessTypeMapper.updateOaBusinessType([], data);
    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除业务类型
   */
  async deleteOaBusinessTypeByTypeIds(typeIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaBusinessTypeMapper.deleteOaBusinessTypeByTypeIds([], { array: typeIds });
    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaBusinessTypeService;
