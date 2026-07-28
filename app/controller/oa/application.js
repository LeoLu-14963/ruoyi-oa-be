/*
 * @Description: 统一申请控制器
 *   提供统一列表查询、详情查询
 *   前端"我的申请"页面只需调这一个接口
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {

  @Route('/oa/application')
  class OaApplicationController extends Controller {

    /**
     * 查询统一申请列表
     * GET /oa/application/list
     * 参数：typeCode(可选), title, status, applicantName, beginTime, endTime, pageNum, pageSize
     */
    @RequiresPermissions('oa:application:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;
      try {
        const params = ctx.query;
        const result = await service.oa.application.selectOaApplicationList(params);
        ctx.body = { code: 200, msg: "查询成功", ...result };
      } catch (err) {
        ctx.logger.error('查询统一申请列表失败:', err);
        ctx.body = { code: 500, msg: err.message || '查询统一申请列表失败' };
      }
    }

    /**
     * 查询申请详情
     * GET /oa/application/:applicationId
     * 返回索引信息，前端再根据 typeCode 调对应业务接口拿表单数据
     */
    @RequiresPermissions('oa:application:query')
    @HttpGet('/:applicationId')
    async getInfo() {
      const { ctx } = this;
      const { applicationId } = ctx.params;
      const result = await ctx.service.oa.application.selectOaApplicationByApplicationId(applicationId);
      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 删除申请（同时删除索引，业务表数据由各业务 service 处理）
     * DELETE /oa/application/:applicationId
     */
    @RequiresPermissions('oa:application:remove')
    @HttpDelete('/:applicationId')
    async remove() {
      const { ctx } = this;
      const { applicationId } = ctx.params;
      // 这里只删除索引记录，业务表数据由前端调对应业务接口删除
      const result = await ctx.service.oa.application.deleteApplicationByApplicationId(applicationId);
      ctx.body = { code: 200, msg: '删除成功', data: result };
    }
  }

  return OaApplicationController;
};
