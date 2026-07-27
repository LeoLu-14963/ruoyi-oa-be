/*
 * @Description: 物料样品评估控制器
 * @Author: 愚者
 * @Date: 2026-07-27
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');
const { Log, BusinessType } = require('../../decorator/log');
const ExcelUtil = require('../../extend/excel');

module.exports = app => {

  @Route('/oa/evaluation')
  class OaSampleEvaluationController extends Controller {

    /**
     * 查询物料样品评估列表
     * GET /oa/evaluation/list
     * 权限：oa:evaluation:list
     */
    @RequiresPermissions('oa:evaluation:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        const result = await service.oa.evaluation.selectOaSampleEvaluationList(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询物料样品评估列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询物料样品评估列表失败'
        };
      }
    }

    /**
     * 查询物料样品评估详情
     * GET /oa/evaluation/:evaluationId
     * 权限：oa:evaluation:query
     */
    @RequiresPermissions('oa:evaluation:query')
    @HttpGet('/:evaluationId')
    async getInfo() {
      const { ctx } = this;
      const { evaluationId } = ctx.params;

      const result = await ctx.service.oa.evaluation.selectOaSampleEvaluationByEvaluationId(evaluationId);

      ctx.body = { code: 200, msg: '操作成功', data: result };
    }

    /**
     * 新增物料样品评估
     * POST /oa/evaluation
     * 权限：oa:evaluation:add
     */
    @RequiresPermissions('oa:evaluation:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加创建人信息
      data.createBy = ctx.state.user.userName;

      const result = await ctx.service.oa.evaluation.insertOaSampleEvaluation(data);

      ctx.body = result;
    }

    /**
     * 修改物料样品评估
     * PUT /oa/evaluation
     * 权限：oa:evaluation:edit
     */
    @RequiresPermissions('oa:evaluation:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const data = ctx.request.body;

      // 添加更新人信息
      data.updateBy = ctx.state.user.userName;

      const result = await ctx.service.oa.evaluation.updateOaSampleEvaluation(data);

      ctx.body = result;
    }

    /**
     * 删除物料样品评估
     * DELETE /oa/evaluation/:evaluationIds
     * 权限：oa:evaluation:remove
     */
    @RequiresPermissions('oa:evaluation:remove')
    @HttpDelete('/:evaluationIds')
    async remove() {
      const { ctx } = this;
      const { evaluationIds } = ctx.params;

      const evaluationIdArray = evaluationIds.split(',');
      const result = await ctx.service.oa.evaluation.deleteOaSampleEvaluationByEvaluationIds(evaluationIdArray);

      ctx.body = result;
    }

    /**
     * 导出物料样品评估
     * POST /oa/evaluation/export
     * 权限：oa:evaluation:export
     */
    @Log({ title: '物料样品评估', businessType: BusinessType.EXPORT })
    @RequiresPermissions('oa:evaluation:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;

      try {
        const params = ctx.request.body;

        const result = await service.oa.evaluation.selectOaSampleEvaluationList(params);
        const list = result.rows || [];

        // 定义 Excel 列配置
        const columns = [
          { header: '评估编号', key: 'evaluationCode', width: 20 },
          { header: '评估标题', key: 'title', width: 20 },
          { header: '供应商名称', key: 'supplierName', width: 20 },
          { header: '物料名称/型号', key: 'materialName', width: 20 },
          { header: '规格', key: 'specification', width: 20 },
          { header: '数量', key: 'quantity', width: 10 },
          { header: '单位', key: 'unit', width: 10 },
          { header: '评估类型', key: 'evaluationType', width: 15 },
          { header: '递交资料', key: 'submittedDocuments', width: 30 },
          { header: '评估目的', key: 'purpose', width: 30 },
          { header: '质检结果', key: 'inspectionResult', width: 30 },
          { header: '检验工具', key: 'inspectionTools', width: 20 },
          { header: '检验标准及结果', key: 'inspectionStandard', width: 30 },
          { header: '质检状态', key: 'inspectionStatus', width: 10 },
          { header: '工程评估意见', key: 'engineeringEvaluation', width: 30 },
          { header: '工程评估状态', key: 'engineeringStatus', width: 10 },
          { header: '试用情况', key: 'trialUsage', width: 30 },
          { header: '试用状态', key: 'trialStatus', width: 10 },
          { header: '最终结论', key: 'finalConclusion', width: 10 },
          { header: '结论说明', key: 'conclusionRemark', width: 30 },
          { header: '状态', key: 'status', width: 10 },
          { header: '备注', key: 'remark', width: 20 },
          { header: '创建者', key: 'createBy', width: 15 },
          { header: '创建时间', key: 'createTime', width: 20 },
        ];

        // 导出 Excel
        ExcelUtil.exportExcel(ctx, list, columns, '物料样品评估数据');
      } catch (err) {
        ctx.logger.error('导出物料样品评估失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出物料样品评估失败'
        };
      }
    }

    /**
     * 提交审批
     * POST /oa/evaluation/submit/:evaluationId
     * 权限：oa:evaluation:edit
     */
    @RequiresPermissions('oa:evaluation:edit')
    @HttpPost('/submit/:evaluationId')
    async submit() {
      const { ctx } = this;
      const { evaluationId } = ctx.params;

      try {
        const result = await ctx.service.oa.evaluation.submitEvaluation(Number(evaluationId));
        ctx.body = result;
      } catch (err) {
        ctx.logger.error('提交审批失败:', err);
        ctx.body = { code: 500, msg: err.message || '提交审批失败' };
      }
    }

    /**
     * 审批操作（通过/驳回）
     * POST /oa/evaluation/approve
     * 权限：oa:evaluation:edit
     *
     * 请求 body:
     * {
     *   "evaluationId": 1,
     *   "action": "2",          // 2=通过, 3=驳回
     *   "opinion": "审批意见",
     *   "fields": {              // 可选，各阶段专业字段
     *     "inspectionResult": "质检结果",
     *     "inspectionTools": "卡尺",
     *     "inspectionStandard": "标准...",
     *     "inspectionStatus": "1",
     *     "engineeringEvaluation": "工程意见",
     *     "engineeringStatus": "1",
     *     "trialUsage": "试用情况",
     *     "trialStatus": "2",
     *     "finalConclusion": "1",
     *     "conclusionRemark": "结论说明"
     *   }
     * }
     */
    @RequiresPermissions('oa:evaluation:edit')
    @HttpPost('/approve')
    async approve() {
      const { ctx } = this;
      const data = ctx.request.body;

      try {
        const result = await ctx.service.oa.evaluation.approveEvaluation(data);
        ctx.body = result;
      } catch (err) {
        ctx.logger.error('审批操作失败:', err);
        ctx.body = { code: 500, msg: err.message || '审批操作失败' };
      }
    }

    /**
     * 查询评估单的审批记录
     * GET /oa/evaluation/records/:evaluationId
     * 权限：oa:evaluation:query
     */
    @RequiresPermissions('oa:evaluation:query')
    @HttpGet('/records/:evaluationId')
    async records() {
      const { ctx } = this;
      const { evaluationId } = ctx.params;

      try {
        const result = await ctx.service.oa.evaluation.selectEvaluationApprovalRecords(Number(evaluationId));
        ctx.body = result;
      } catch (err) {
        ctx.logger.error('查询审批记录失败:', err);
        ctx.body = { code: 500, msg: err.message || '查询审批记录失败' };
      }
    }
  }

  return OaSampleEvaluationController;
};
