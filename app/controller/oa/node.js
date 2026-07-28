/*
 * @Description: 审批节点配置控制器（通用节点池模式）
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 * @Update: 2026-07-28 改为通用节点池，移除 flow_id 和 node_order
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/node')
  class OaApprovalNodeController extends Controller {

    /**
     * 查询审批节点列表
     * GET /oa/node/list
     * 权限：oa:node:list
     */
    @RequiresPermissions('oa:node:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.oa.node.selectOaApprovalNodeList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询审批节点列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询审批节点列表失败'
        };
      }
    }

    /**
     * 查询审批节点详情
     * GET /oa/node/:nodeId
     * 权限：oa:node:query
     */
    @RequiresPermissions('oa:node:query')
    @HttpGet('/:nodeId')
    async getInfo() {
      const { ctx } = this;
      const { nodeId } = ctx.params;

      const result = await ctx.service.oa.node.selectOaApprovalNodeByNodeId(nodeId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增审批节点
     * POST /oa/node
     * 权限：oa:node:add
     */
    @RequiresPermissions('oa:node:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.node.insertOaApprovalNode(data);

      ctx.body = result;
    }

    /**
     * 修改审批节点
     * PUT /oa/node
     * 权限：oa:node:edit
     */
    @RequiresPermissions('oa:node:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.node.updateOaApprovalNode(data);

      ctx.body = result;
    }

    /**
     * 删除审批节点
     * DELETE /oa/node/:nodeIds
     * 权限：oa:node:remove
     */
    @RequiresPermissions('oa:node:remove')
    @HttpDelete('/:nodeIds')
    async remove() {
      const { ctx } = this;
      const { nodeIds } = ctx.params;

      const nodeIdArray = nodeIds.split(',');
      const result = await ctx.service.oa.node.deleteOaApprovalNodeByNodeIds(nodeIdArray);

      ctx.body = result;
    }

    /**
     * 导出审批节点
     * POST /oa/node/export
     * 权限：oa:node:export
     */
    @Log({ title: '审批节点配置', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:node:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        // 查询审批节点列表
        const result = await service.oa.node.selectOaApprovalNodeList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '节点编码', key: 'nodeCode', width: 20 },
          { header: '节点名称', key: 'nodeName', width: 20 },
          { header: '节点类型(0发起1审批2会签3或签4结束)', key: 'nodeType', width: 20 },
          { header: '审批类型(1角色2人员3部门)', key: 'approvalType', width: 20 },
          { header: '审批人ID列表，逗号分隔', key: 'approverIds', width: 20 },
          { header: '审批角色ID', key: 'roleId', width: 20 },
          { header: '审批部门ID', key: 'deptId', width: 20 },
          { header: '审批意见模板', key: 'approvalDecision', width: 20 },
          { header: '是否可驳回(0否1是)', key: 'canReject', width: 20 },
          { header: '是否可修改(0否1是)', key: 'canModify', width: 20 },
          { header: '备注', key: 'remark', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '审批节点配置数据');
      } catch (err) {
        ctx.logger.error('导出审批节点配置失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出审批节点配置失败'
        };
      }
    }
  }

  return OaApprovalNodeController;
};
