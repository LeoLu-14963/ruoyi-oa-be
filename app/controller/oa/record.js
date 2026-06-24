/*
 * @Description: 审批记录控制器
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/record')
  class OaApprovalRecordController extends Controller {

    /**
     * 查询审批记录列表
     * GET /oa/record/list
     * 权限：oa:record:list
     */
    @RequiresPermissions('oa:record:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.record.selectOaApprovalRecordList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询审批记录列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询审批记录列表失败'
        };
      }
    }

    /**
     * 查询审批记录详情
     * GET /oa/record/:recordId
     * 权限：oa:record:query
     */
    @RequiresPermissions('oa:record:query')
    @HttpGet('/:recordId')
    async getInfo() {
      const { ctx } = this;
      const { recordId } = ctx.params;

      const result = await ctx.service.oa.record.selectOaApprovalRecordByRecordId(recordId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增审批记录
     * POST /oa/record
     * 权限：oa:record:add
     */
    @RequiresPermissions('oa:record:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.record.insertOaApprovalRecord(data);

      ctx.body = result;
    }

    /**
     * 修改审批记录
     * PUT /oa/record
     * 权限：oa:record:edit
     */
    @RequiresPermissions('oa:record:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.record.updateOaApprovalRecord(data);

      ctx.body = result;
    }

    /**
     * 删除审批记录
     * DELETE /oa/record/:recordIds
     * 权限：oa:record:remove
     */
    @RequiresPermissions('oa:record:remove')
    @HttpDelete('/:recordIds')
    async remove() {
      const { ctx } = this;
      const { recordIds } = ctx.params;

      const recordIdArray = recordIds.split(',');
      const result = await ctx.service.oa.record.deleteOaApprovalRecordByRecordIds(recordIdArray);

      ctx.body = result;
    }

    /**
     * 导出审批记录
     * POST /oa/record/export
     * 权限：oa:record:export
     */
    @Log({ title: '审批记录', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:record:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询审批记录列表
        const result = await service.oa.record.selectOaApprovalRecordList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '业务ID', key: 'businessId', width: 20 },
          { header: '业务类型', key: 'businessType', width: 20 },
          { header: '节点ID', key: 'nodeId', width: 20 },
          { header: '节点名称', key: 'nodeName', width: 20 },
          { header: '审批人ID', key: 'approverId', width: 20 },
          { header: '审批人姓名', key: 'approverName', width: 20 },
          { header: '审批时间', key: 'approveTime', width: 20 },
          { header: '动作(1提交2通过3驳回4会签通过5会签驳回)', key: 'action', width: 20 },
          { header: '审批意见', key: 'opinion', width: 20 },
          { header: '附件地址', key: 'attachmentUrl', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '审批记录数据');
      } catch (err) {
        ctx.logger.error('导出审批记录失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出审批记录失败'
        };
      }
    }
  }

  return OaApprovalRecordController;
};
