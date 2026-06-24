/*
 * @Description: 审批流程配置控制器
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/flow')
  class OaApprovalFlowController extends Controller {

    /**
     * 查询审批流程配置列表
     * GET /oa/flow/list
     * 权限：oa:flow:list
     */
    @RequiresPermissions('oa:flow:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.flow.selectOaApprovalFlowList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询审批流程配置列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询审批流程配置列表失败'
        };
      }
    }

    /**
     * 查询审批流程配置详情
     * GET /oa/flow/:flowId
     * 权限：oa:flow:query
     */
    @RequiresPermissions('oa:flow:query')
    @HttpGet('/:flowId')
    async getInfo() {
      const { ctx } = this;
      const { flowId } = ctx.params;

      const result = await ctx.service.oa.flow.selectOaApprovalFlowByFlowId(flowId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增审批流程配置
     * POST /oa/flow
     * 权限：oa:flow:add
     */
    @RequiresPermissions('oa:flow:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.flow.insertOaApprovalFlow(data);

      ctx.body = result;
    }

    /**
     * 修改审批流程配置
     * PUT /oa/flow
     * 权限：oa:flow:edit
     */
    @RequiresPermissions('oa:flow:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.flow.updateOaApprovalFlow(data);

      ctx.body = result;
    }

    /**
     * 删除审批流程配置
     * DELETE /oa/flow/:flowIds
     * 权限：oa:flow:remove
     */
    @RequiresPermissions('oa:flow:remove')
    @HttpDelete('/:flowIds')
    async remove() {
      const { ctx } = this;
      const { flowIds } = ctx.params;

      const flowIdArray = flowIds.split(',');
      const result = await ctx.service.oa.flow.deleteOaApprovalFlowByFlowIds(flowIdArray);

      ctx.body = result;
    }

    /**
     * 导出审批流程配置
     * POST /oa/flow/export
     * 权限：oa:flow:export
     */
    @Log({ title: '审批流程配置', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:flow:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询审批流程配置列表
        const result = await service.oa.flow.selectOaApprovalFlowList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '流程编码', key: 'flowCode', width: 20 },
          { header: '流程名称', key: 'flowName', width: 20 },
          { header: '流程类型', key: 'flowType', width: 20 },
          { header: '流程描述', key: 'description', width: 20 },
          { header: '状态(0草稿1启用2停用)', key: 'status', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '审批流程配置数据');
      } catch (err) {
        ctx.logger.error('导出审批流程配置失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出审批流程配置失败'
        };
      }
    }
  }

  return OaApprovalFlowController;
};
