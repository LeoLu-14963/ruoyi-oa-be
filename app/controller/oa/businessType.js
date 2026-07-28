/*
 * @Description: 业务类型配置控制器
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {

  @Route('/oa/business-type')
  class OaBusinessTypeController extends Controller {

    /**
     * 查询业务类型列表
     * GET /oa/business-type/list
     */
    @RequiresPermissions('oa:businessType:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;
      try {
        const params = ctx.query;
        const result = await service.oa.businessType.selectOaBusinessTypeList(params);
        ctx.body = { code: 200, msg: "查询成功", ...result };
      } catch (err) {
        ctx.logger.error('查询业务类型列表失败:', err);
        ctx.body = { code: 500, msg: err.message || '查询业务类型列表失败' };
      }
    }

    /**
     * 按编码查询业务类型（含表单配置，前端动态表单用）
     * GET /oa/business-type/code/:typeCode
     */
    @RequiresPermissions('oa:businessType:query')
    @HttpGet('/code/:typeCode')
    async getByCode() {
      const { ctx } = this;
      const { typeCode } = ctx.params;
      const result = await ctx.service.oa.businessType.selectOaBusinessTypeByTypeCode(typeCode);

      if (!result) {
        ctx.body = { code: 404, msg: '业务类型不存在' };
        return;
      }

      // 解析 formConfig JSON
      if (result.formConfig && typeof result.formConfig === 'string') {
        result.formConfig = JSON.parse(result.formConfig);
      }

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 查询业务类型详情
     * GET /oa/business-type/:typeId
     */
    @RequiresPermissions('oa:businessType:query')
    @HttpGet('/:typeId')
    async getInfo() {
      const { ctx } = this;
      const { typeId } = ctx.params;
      const result = await ctx.service.oa.businessType.selectOaBusinessTypeByTypeId(typeId);

      if (result && result.formConfig && typeof result.formConfig === 'string') {
        result.formConfig = JSON.parse(result.formConfig);
      }

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增业务类型
     * POST /oa/business-type
     */
    @RequiresPermissions('oa:businessType:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;
      data.createBy = ctx.state.user.userName;
      const result = await ctx.service.oa.businessType.insertOaBusinessType(data);
      ctx.body = result;
    }

    /**
     * 修改业务类型（绑定流程 / 配置表单）
     * PUT /oa/business-type
     */
    @RequiresPermissions('oa:businessType:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;
      data.updateBy = ctx.state.user.userName;
      const result = await ctx.service.oa.businessType.updateOaBusinessType(data);
      ctx.body = result;
    }

    /**
     * 删除业务类型
     * DELETE /oa/business-type/:typeIds
     */
    @RequiresPermissions('oa:businessType:remove')
    @HttpDelete('/:typeIds')
    async remove() {
      const { ctx } = this;
      const { typeIds } = ctx.params;
      const typeIdArray = typeIds.split(',');
      const result = await ctx.service.oa.businessType.deleteOaBusinessTypeByTypeIds(typeIdArray);
      ctx.body = result;
    }
  }

  return OaBusinessTypeController;
};
