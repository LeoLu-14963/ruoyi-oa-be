/*
 * @Description: Swagger OpenAPI 规范生成服务（供 /tool/swagger 与 /swagger-ui 共用）
 * @Author: AI Assistant
 * @Date: 2025-02-02
 */

const Service = require('egg').Service;

// ============================================================
// Schema 定义区
// ============================================================

const schemas = {
  // 统一响应包装
  ApiResult: {
    type: 'object',
    properties: {
      code: { type: 'integer', description: '状态码，200=成功' },
      msg: { type: 'string', description: '提示信息' },
    },
  },

  PageResult: {
    type: 'object',
    properties: {
      code: { type: 'integer', example: 200 },
      msg: { type: 'string', example: '查询成功' },
      total: { type: 'integer', description: '总记录数' },
      rows: { type: 'array', items: { type: 'object' }, description: '列表数据' },
    },
  },

  // 物料样品评估
  SampleEvaluation: {
    type: 'object',
    description: '物料样品评估',
    properties: {
      evaluationId: { type: 'integer', description: '评估ID' },
      evaluationCode: { type: 'string', description: '评估编号', example: 'PG-2026-001' },
      title: { type: 'string', description: '评估标题', example: 'XX供应商-电阻样品评估' },
      supplierId: { type: 'integer', description: '供应商ID' },
      supplierName: { type: 'string', description: '供应商名称（冗余）' },
      materialName: { type: 'string', description: '物料名称/型号', example: 'RJ-0805-10K' },
      specification: { type: 'string', description: '规格', example: '0805 10KΩ ±1%' },
      quantity: { type: 'integer', description: '样品数量' },
      unit: { type: 'string', description: '单位', example: '个' },
      evaluationType: { type: 'string', description: '评估类型（新增/替代/例行）' },
      submittedDocuments: { type: 'string', description: '递交资料，JSON数组字符串', example: '["ISO9001","TDS","MSDS","ROHS","REACH"]' },
      purpose: { type: 'string', description: '评估目的' },
      inspectionResult: { type: 'string', description: '质检结果描述' },
      inspectionTools: { type: 'string', description: '检验工具（如卡尺、硬度计等）' },
      inspectionStandard: { type: 'string', description: '检验标准及结果' },
      inspectionStatus: { type: 'string', description: '质检状态（0未检 1已检）', enum: ['0', '1'] },
      engineeringEvaluation: { type: 'string', description: '工程评估意见' },
      engineeringStatus: { type: 'string', description: '工程评估状态（0未评估 1已评估）', enum: ['0', '1'] },
      trialUsage: { type: 'string', description: '试用情况描述' },
      trialStatus: { type: 'string', description: '试用状态（0未试用 1试用中 2已完成）', enum: ['0', '1', '2'] },
      finalConclusion: { type: 'string', description: '最终结论（0不合格 1合格 2有条件合格）', enum: ['0', '1', '2'] },
      conclusionRemark: { type: 'string', description: '结论说明' },
      status: { type: 'string', description: '评估单状态（0草稿 1待审批 2审批中 3已通过 4已驳回 5已完成）', enum: ['0', '1', '2', '3', '4', '5'] },
      currentNodeId: { type: 'integer', description: '当前审批节点ID（对应oa_approval_node.node_id）' },
      currentApproverId: { type: 'integer', description: '当前审批人ID' },
      processInstanceId: { type: 'string', description: '流程实例ID' },
      attachmentUrl: { type: 'string', description: '附件地址（评估报告等）' },
      remark: { type: 'string', description: '备注' },
      createBy: { type: 'string', description: '创建者' },
      createTime: { type: 'string', format: 'date-time', description: '创建时间' },
      updateBy: { type: 'string', description: '更新者' },
      updateTime: { type: 'string', format: 'date-time', description: '更新时间' },
      details: {
        type: 'array',
        description: '评估明细列表（仅详情接口返回）',
        items: { $ref: '#/components/schemas/SampleEvaluationDetail' },
      },
    },
  },

  SampleEvaluationDetail: {
    type: 'object',
    description: '评估明细',
    properties: {
      detailId: { type: 'integer', description: '明细ID' },
      evaluationId: { type: 'integer', description: '评估ID' },
      materialName: { type: 'string', description: '物料名称/型号' },
      specification: { type: 'string', description: '规格' },
      quantity: { type: 'integer', description: '数量' },
      unit: { type: 'string', description: '单位' },
      inspectionResult: { type: 'string', description: '质检结果' },
      inspectionStandard: { type: 'string', description: '检验标准及结果' },
      engineeringEvaluation: { type: 'string', description: '工程评估意见' },
      trialUsage: { type: 'string', description: '试用情况' },
      conclusion: { type: 'string', description: '单项结论（0不合格 1合格 2有条件合格）', enum: ['0', '1', '2'] },
      remark: { type: 'string', description: '备注' },
      createBy: { type: 'string', description: '创建者' },
      createTime: { type: 'string', format: 'date-time', description: '创建时间' },
      updateBy: { type: 'string', description: '更新者' },
      updateTime: { type: 'string', format: 'date-time', description: '更新时间' },
    },
  },

  // 供应商
  Supplier: {
    type: 'object',
    description: '供应商',
    properties: {
      supplierId: { type: 'integer', description: '供应商ID' },
      supplierCode: { type: 'string', description: '供应商编码' },
      supplierName: { type: 'string', description: '供应商名称' },
      supplierType: { type: 'string', description: '供应商类型' },
      contactName: { type: 'string', description: '联系人' },
      contactPhone: { type: 'string', description: '联系电话' },
      contactEmail: { type: 'string', description: '联系邮箱' },
      address: { type: 'string', description: '地址' },
      creditCode: { type: 'string', description: '统一社会信用代码' },
      bankName: { type: 'string', description: '开户银行' },
      bankAccount: { type: 'string', description: '银行账号' },
      status: { type: 'string', description: '状态（0正常 1停用）', enum: ['0', '1'] },
      remark: { type: 'string', description: '备注' },
      createBy: { type: 'string', description: '创建者' },
      createTime: { type: 'string', format: 'date-time', description: '创建时间' },
      updateBy: { type: 'string', description: '更新者' },
      updateTime: { type: 'string', format: 'date-time', description: '更新时间' },
    },
  },

  // 审批流程
  ApprovalFlow: {
    type: 'object',
    description: '审批流程配置',
    properties: {
      flowId: { type: 'integer', description: '流程ID' },
      flowCode: { type: 'string', description: '流程编码' },
      flowName: { type: 'string', description: '流程名称' },
      flowType: { type: 'string', description: '流程类型' },
      description: { type: 'string', description: '流程描述' },
      status: { type: 'string', description: '状态（0草稿 1启用 2停用）', enum: ['0', '1', '2'] },
      remark: { type: 'string' },
      createBy: { type: 'string' },
      createTime: { type: 'string', format: 'date-time' },
      updateBy: { type: 'string' },
      updateTime: { type: 'string', format: 'date-time' },
    },
  },

  ApprovalNode: {
    type: 'object',
    description: '审批节点配置',
    properties: {
      nodeId: { type: 'integer', description: '节点ID' },
      flowId: { type: 'integer', description: '流程ID' },
      nodeCode: { type: 'string', description: '节点编码' },
      nodeName: { type: 'string', description: '节点名称' },
      nodeOrder: { type: 'integer', description: '节点顺序' },
      nodeType: { type: 'string', description: '节点类型（0发起 1审批 2会签 3或签 4结束）' },
      approvalType: { type: 'string', description: '审批类型（1角色 2人员 3部门）' },
      approverIds: { type: 'string', description: '审批人ID列表，逗号分隔' },
      roleId: { type: 'integer', description: '审批角色ID' },
      deptId: { type: 'integer', description: '审批部门ID' },
      approvalDecision: { type: 'string', description: '审批意见模板' },
      canReject: { type: 'string', description: '是否可驳回（0否 1是）' },
      canModify: { type: 'string', description: '是否可修改（0否 1是）' },
      remark: { type: 'string' },
      createBy: { type: 'string' },
      createTime: { type: 'string', format: 'date-time' },
      updateBy: { type: 'string' },
      updateTime: { type: 'string', format: 'date-time' },
    },
  },

  ApprovalRecord: {
    type: 'object',
    description: '审批记录',
    properties: {
      recordId: { type: 'integer', description: '记录ID' },
      businessId: { type: 'integer', description: '业务ID（如评估单ID）' },
      businessType: { type: 'string', description: '业务类型（如 SAMPLE_EVALUATION）' },
      nodeId: { type: 'integer', description: '节点ID' },
      nodeName: { type: 'string', description: '节点名称' },
      approverId: { type: 'integer', description: '审批人ID' },
      approverName: { type: 'string', description: '审批人姓名' },
      approveTime: { type: 'string', format: 'date-time', description: '审批时间' },
      action: { type: 'string', description: '动作（1提交 2通过 3驳回 4会签通过 5会签驳回）' },
      opinion: { type: 'string', description: '审批意见' },
      attachmentUrl: { type: 'string', description: '附件地址' },
      remark: { type: 'string' },
      createBy: { type: 'string' },
      createTime: { type: 'string', format: 'date-time' },
      updateBy: { type: 'string' },
      updateTime: { type: 'string', format: 'date-time' },
    },
  },
};

// 枚举字典
const enums = {
  evaluationStatus: [
    { value: '0', label: '草稿' },
    { value: '1', label: '待审批' },
    { value: '2', label: '审批中' },
    { value: '3', label: '已通过' },
    { value: '4', label: '已驳回' },
    { value: '5', label: '已完成' },
  ],
  inspectionStatus: [
    { value: '0', label: '未检' },
    { value: '1', label: '已检' },
  ],
  engineeringStatus: [
    { value: '0', label: '未评估' },
    { value: '1', label: '已评估' },
  ],
  trialStatus: [
    { value: '0', label: '未试用' },
    { value: '1', label: '试用中' },
    { value: '2', label: '已完成' },
  ],
  finalConclusion: [
    { value: '0', label: '不合格' },
    { value: '1', label: '合格' },
    { value: '2', label: '有条件合格' },
  ],
  approvalAction: [
    { value: '1', label: '提交' },
    { value: '2', label: '通过' },
    { value: '3', label: '驳回' },
    { value: '4', label: '会签通过' },
    { value: '5', label: '会签驳回' },
  ],
};

class SwaggerService extends Service {
  /**
   * 生成 OpenAPI 3.0 规范 JSON
   * @param {object} ctx - 上下文
   * @return {object} OpenAPI spec
   */
  async getOpenApiSpec(ctx) {
    const host = ctx.request.host;
    const protocol = ctx.request.protocol;
    const basePath = ctx.app.config.apiPrefix || '';

    // ---- 手工定义的带 Schema 的路径 ----
    const manualPaths = this._buildManualPaths();

    // ---- 自动收集的路径（无 Schema，只有路径摘要） ----
    const autoPaths = {};
    const skipPrefixes = ['/public', '/tool/swagger', '/swagger-ui', '/favicon'];
    const manualPathKeys = new Set(Object.keys(manualPaths).flatMap(p =>
      Object.keys(manualPaths[p]).map(m => `${m.toUpperCase()} ${p}`)
    ));

    const addAutoPath = (path, method, summary, tag) => {
      const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
      if (!httpMethods.includes(method)) return;
      const key = `${method.toUpperCase()} ${path}`;
      if (manualPathKeys.has(key)) return; // 跳过手工定义的
      if (!autoPaths[path]) autoPaths[path] = {};
      autoPaths[path][method] = {
        summary: summary || `${method.toUpperCase()} ${path}`,
        tags: [tag || path.split('/').filter(Boolean).slice(0, 2).join('/') || 'api'],
        responses: { 200: { description: 'OK' } },
      };
      if (['post', 'put', 'patch'].includes(method)) {
        autoPaths[path][method].requestBody = {
          content: { 'application/json': { schema: { type: 'object' } } },
        };
      }
      if (!['/login', '/register', '/captchaImage'].includes(path)) {
        autoPaths[path][method].security = [{ bearerAuth: [] }];
      }
    };

    try {
      const decoratorState = require('egg-decorator-router/lib/state');
      const routes = decoratorState.routes || {};
      for (const key of Object.keys(routes)) {
        const item = routes[key];
        const fullpath = item.route && item.route[1];
        const method = (item.method || '').toLowerCase();
        if (!fullpath || typeof fullpath !== 'string') continue;
        if (skipPrefixes.some(p => fullpath.startsWith(p))) continue;
        addAutoPath(fullpath, method, `${method.toUpperCase()} ${fullpath}`, fullpath.split('/').filter(Boolean).slice(0, 2).join('/') || 'api');
      }
    } catch (e) {
      ctx.app.coreLogger.warn('[swagger] decorator state.routes not available:', e.message);
    }

    // 合并：手工路径优先
    const paths = { ...autoPaths, ...manualPaths };

    return {
      openapi: '3.0.0',
      info: {
        title: '安旭特OA系统 API 文档',
        description: '基于若依(Egg.js)框架的后端接口文档\n\n## 枚举字典\n\n' +
          Object.entries(enums).map(([k, v]) =>
            `### ${k}\n| 值 | 含义 |\n|---|---|\n` + v.map(i => `| ${i.value} | ${i.label} |`).join('\n')
          ).join('\n\n'),
        version: '1.0.0',
      },
      servers: [
        { url: `${protocol}://${host}${basePath}`, description: '当前服务' },
      ],
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas,
      },
      tags: [
        { name: 'oa/evaluation', description: '物料样品评估' },
        { name: 'oa/supplier', description: '供应商管理' },
        { name: 'oa/flow', description: '审批流程配置' },
        { name: 'oa/node', description: '审批节点配置' },
        { name: 'oa/record', description: '审批记录' },
        { name: 'system', description: '系统管理' },
        { name: 'monitor', description: '系统监控' },
        { name: 'tool', description: '系统工具' },
      ],
    };
  }

  /**
   * 构建带 Schema 的手工路径定义
   */
  _buildManualPaths() {
    const security = [{ bearerAuth: [] }];
    const jsonContent = (schemaRef) => ({
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaRef}` } } },
    });
    const okResponse = (schemaRef) => ({
      200: {
        description: '成功',
        ...jsonContent(schemaRef),
      },
    });

    return {
      // ============================================================
      // 物料样品评估 /oa/evaluation
      // ============================================================
      '/oa/evaluation/list': {
        get: {
          summary: '查询物料样品评估列表（分页）',
          tags: ['oa/evaluation'],
          security,
          parameters: [
            { name: 'pageNum', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 }, description: '每页条数' },
            { name: 'evaluationCode', in: 'query', schema: { type: 'string' }, description: '评估编号' },
            { name: 'title', in: 'query', schema: { type: 'string' }, description: '评估标题（模糊）' },
            { name: 'supplierId', in: 'query', schema: { type: 'integer' }, description: '供应商ID' },
            { name: 'supplierName', in: 'query', schema: { type: 'string' }, description: '供应商名称（模糊）' },
            { name: 'materialName', in: 'query', schema: { type: 'string' }, description: '物料名称（模糊）' },
            { name: 'evaluationType', in: 'query', schema: { type: 'string' }, description: '评估类型' },
            { name: 'inspectionStatus', in: 'query', schema: { type: 'string' }, description: '质检状态' },
            { name: 'engineeringStatus', in: 'query', schema: { type: 'string' }, description: '工程评估状态' },
            { name: 'trialStatus', in: 'query', schema: { type: 'string' }, description: '试用状态' },
            { name: 'finalConclusion', in: 'query', schema: { type: 'string' }, description: '最终结论' },
            { name: 'status', in: 'query', schema: { type: 'string' }, description: '评估单状态' },
            { name: 'beginTime', in: 'query', schema: { type: 'string' }, description: '创建开始日期' },
            { name: 'endTime', in: 'query', schema: { type: 'string' }, description: '创建结束日期' },
          ],
          responses: okResponse('PageResult'),
        },
      },
      '/oa/evaluation/{evaluationId}': {
        get: {
          summary: '查询物料样品评估详情（含明细）',
          tags: ['oa/evaluation'],
          security,
          parameters: [
            { name: 'evaluationId', in: 'path', required: true, schema: { type: 'integer' }, description: '评估ID' },
          ],
          responses: okResponse('SampleEvaluation'),
        },
        delete: {
          summary: '删除物料样品评估（含明细级联删除）',
          tags: ['oa/evaluation'],
          security,
          parameters: [
            { name: 'evaluationId', in: 'path', required: true, schema: { type: 'string' }, description: '评估ID，多个用逗号分隔' },
          ],
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/evaluation': {
        post: {
          summary: '新增物料样品评估（含明细）',
          tags: ['oa/evaluation'],
          security,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SampleEvaluation' },
                example: {
                  evaluationCode: 'PG-2026-002',
                  title: 'YY供应商-电容样品评估',
                  supplierId: 2,
                  supplierName: '广州市YY电子科技有限公司',
                  materialName: 'CC-0603-100nF',
                  specification: '0603 100nF X7R 50V',
                  quantity: 100,
                  unit: '个',
                  evaluationType: '替代',
                  submittedDocuments: '["ISO9001","ROHS"]',
                  purpose: '替代原有供应商，评估其电容样品质量',
                  status: '0',
                  details: [
                    { materialName: 'CC-0603-100nF', specification: '0603 100nF X7R 50V', quantity: 50, unit: '个' },
                    { materialName: 'CC-0603-1uF', specification: '0603 1uF X5R 25V', quantity: 50, unit: '个' },
                  ],
                },
              },
            },
          },
          responses: okResponse('ApiResult'),
        },
        put: {
          summary: '修改物料样品评估（含明细，details传了会先删后增）',
          tags: ['oa/evaluation'],
          security,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SampleEvaluation' },
              },
            },
          },
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/evaluation/export': {
        post: {
          summary: '导出物料样品评估 Excel',
          tags: ['oa/evaluation'],
          security,
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object' },
                example: { title: '', status: '', supplierName: '' },
              },
            },
          },
          responses: {
            200: {
              description: 'Excel文件流',
              content: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {} },
            },
          },
        },
      },

      // ---- 审批流转接口 ----

      '/oa/evaluation/submit/{evaluationId}': {
        post: {
          summary: '提交审批（草稿 -> 审批中，自动定位到第一个审批节点）',
          tags: ['oa/evaluation'],
          security,
          parameters: [
            { name: 'evaluationId', in: 'path', required: true, schema: { type: 'integer' }, description: '评估ID' },
          ],
          responses: okResponse('ApiResult'),
        },
      },

      '/oa/evaluation/approve': {
        post: {
          summary: '审批操作（通过/驳回），可同时回填当前阶段专业字段',
          tags: ['oa/evaluation'],
          security,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['evaluationId', 'action'],
                  properties: {
                    evaluationId: { type: 'integer', description: '评估ID' },
                    action: { type: 'string', enum: ['2', '3'], description: '2=通过, 3=驳回' },
                    opinion: { type: 'string', description: '审批意见' },
                    fields: {
                      type: 'object',
                      description: '可选，当前阶段专业字段（根据当前节点类型填写对应字段）',
                      properties: {
                        inspectionResult: { type: 'string', description: '质检结果（质检节点填写）' },
                        inspectionTools: { type: 'string', description: '检验工具（质检节点填写）' },
                        inspectionStandard: { type: 'string', description: '检验标准及结果（质检节点填写）' },
                        inspectionStatus: { type: 'string', enum: ['0', '1'], description: '质检状态（质检节点填写）' },
                        engineeringEvaluation: { type: 'string', description: '工程评估意见（工程节点填写）' },
                        engineeringStatus: { type: 'string', enum: ['0', '1'], description: '工程评估状态（工程节点填写）' },
                        trialUsage: { type: 'string', description: '试用情况（试用节点填写）' },
                        trialStatus: { type: 'string', enum: ['0', '1', '2'], description: '试用状态（试用节点填写）' },
                        finalConclusion: { type: 'string', enum: ['0', '1', '2'], description: '最终结论（主管审批节点填写）' },
                        conclusionRemark: { type: 'string', description: '结论说明（主管审批节点填写）' },
                      },
                    },
                  },
                },
                example: {
                  evaluationId: 1,
                  action: '2',
                  opinion: '质检合格，同意进入工程评估',
                  fields: {
                    inspectionResult: '外观无瑕疵，尺寸符合标准',
                    inspectionTools: '卡尺、万用表',
                    inspectionStandard: '阻值偏差±1%以内',
                    inspectionStatus: '1',
                  },
                },
              },
            },
          },
          responses: okResponse('ApiResult'),
        },
      },

      '/oa/evaluation/records/{evaluationId}': {
        get: {
          summary: '查询评估单的审批记录列表',
          tags: ['oa/evaluation'],
          security,
          parameters: [
            { name: 'evaluationId', in: 'path', required: true, schema: { type: 'integer' }, description: '评估ID' },
          ],
          responses: okResponse('ApprovalRecord'),
        },
      },

      // ============================================================
      // 供应商管理 /oa/supplier
      // ============================================================
      '/oa/supplier/list': {
        get: {
          summary: '查询供应商列表（分页）',
          tags: ['oa/supplier'],
          security,
          parameters: [
            { name: 'pageNum', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'supplierCode', in: 'query', schema: { type: 'string' }, description: '供应商编码' },
            { name: 'supplierName', in: 'query', schema: { type: 'string' }, description: '供应商名称（模糊）' },
            { name: 'supplierType', in: 'query', schema: { type: 'string' }, description: '供应商类型' },
            { name: 'contactName', in: 'query', schema: { type: 'string' }, description: '联系人（模糊）' },
            { name: 'contactPhone', in: 'query', schema: { type: 'string' }, description: '联系电话' },
            { name: 'status', in: 'query', schema: { type: 'string' }, description: '状态（0正常 1停用）' },
          ],
          responses: okResponse('PageResult'),
        },
      },
      '/oa/supplier/{supplierId}': {
        get: {
          summary: '查询供应商详情',
          tags: ['oa/supplier'],
          security,
          parameters: [{ name: 'supplierId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: okResponse('Supplier'),
        },
        delete: {
          summary: '删除供应商',
          tags: ['oa/supplier'],
          security,
          parameters: [{ name: 'supplierId', in: 'path', required: true, schema: { type: 'string' }, description: '多个用逗号分隔' }],
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/supplier': {
        post: {
          summary: '新增供应商',
          tags: ['oa/supplier'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Supplier' } } } },
          responses: okResponse('ApiResult'),
        },
        put: {
          summary: '修改供应商',
          tags: ['oa/supplier'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Supplier' } } } },
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/supplier/export': {
        post: {
          summary: '导出供应商 Excel',
          tags: ['oa/supplier'],
          security,
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Excel文件流' } },
        },
      },

      // ============================================================
      // 审批流程配置 /oa/flow
      // ============================================================
      '/oa/flow/list': {
        get: {
          summary: '查询审批流程列表（分页）',
          tags: ['oa/flow'],
          security,
          parameters: [
            { name: 'pageNum', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'flowCode', in: 'query', schema: { type: 'string' }, description: '流程编码' },
            { name: 'flowName', in: 'query', schema: { type: 'string' }, description: '流程名称' },
            { name: 'flowType', in: 'query', schema: { type: 'string' }, description: '流程类型' },
            { name: 'status', in: 'query', schema: { type: 'string' }, description: '状态' },
          ],
          responses: okResponse('PageResult'),
        },
      },
      '/oa/flow/{flowId}': {
        get: {
          summary: '查询审批流程详情',
          tags: ['oa/flow'],
          security,
          parameters: [{ name: 'flowId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: okResponse('ApprovalFlow'),
        },
        delete: {
          summary: '删除审批流程',
          tags: ['oa/flow'],
          security,
          parameters: [{ name: 'flowId', in: 'path', required: true, schema: { type: 'string' }, description: '多个用逗号分隔' }],
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/flow': {
        post: {
          summary: '新增审批流程',
          tags: ['oa/flow'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalFlow' } } } },
          responses: okResponse('ApiResult'),
        },
        put: {
          summary: '修改审批流程',
          tags: ['oa/flow'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalFlow' } } } },
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/flow/export': {
        post: {
          summary: '导出审批流程 Excel',
          tags: ['oa/flow'],
          security,
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Excel文件流' } },
        },
      },

      // ============================================================
      // 审批节点配置 /oa/node
      // ============================================================
      '/oa/node/list': {
        get: {
          summary: '查询审批节点列表（分页）',
          tags: ['oa/node'],
          security,
          parameters: [
            { name: 'pageNum', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'flowId', in: 'query', schema: { type: 'integer' }, description: '流程ID' },
            { name: 'nodeCode', in: 'query', schema: { type: 'string' }, description: '节点编码' },
            { name: 'nodeName', in: 'query', schema: { type: 'string' }, description: '节点名称' },
            { name: 'nodeType', in: 'query', schema: { type: 'string' }, description: '节点类型' },
          ],
          responses: okResponse('PageResult'),
        },
      },
      '/oa/node/{nodeId}': {
        get: {
          summary: '查询审批节点详情',
          tags: ['oa/node'],
          security,
          parameters: [{ name: 'nodeId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: okResponse('ApprovalNode'),
        },
        delete: {
          summary: '删除审批节点',
          tags: ['oa/node'],
          security,
          parameters: [{ name: 'nodeId', in: 'path', required: true, schema: { type: 'string' }, description: '多个用逗号分隔' }],
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/node': {
        post: {
          summary: '新增审批节点',
          tags: ['oa/node'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalNode' } } } },
          responses: okResponse('ApiResult'),
        },
        put: {
          summary: '修改审批节点',
          tags: ['oa/node'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalNode' } } } },
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/node/export': {
        post: {
          summary: '导出审批节点 Excel',
          tags: ['oa/node'],
          security,
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Excel文件流' } },
        },
      },

      // ============================================================
      // 审批记录 /oa/record
      // ============================================================
      '/oa/record/list': {
        get: {
          summary: '查询审批记录列表（分页）',
          tags: ['oa/record'],
          security,
          parameters: [
            { name: 'pageNum', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'businessId', in: 'query', schema: { type: 'integer' }, description: '业务ID' },
            { name: 'businessType', in: 'query', schema: { type: 'string' }, description: '业务类型（如 SAMPLE_EVALUATION）' },
            { name: 'approverId', in: 'query', schema: { type: 'integer' }, description: '审批人ID' },
            { name: 'action', in: 'query', schema: { type: 'string' }, description: '动作（1提交 2通过 3驳回 4会签通过 5会签驳回）' },
          ],
          responses: okResponse('PageResult'),
        },
      },
      '/oa/record/{recordId}': {
        get: {
          summary: '查询审批记录详情',
          tags: ['oa/record'],
          security,
          parameters: [{ name: 'recordId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: okResponse('ApprovalRecord'),
        },
        delete: {
          summary: '删除审批记录',
          tags: ['oa/record'],
          security,
          parameters: [{ name: 'recordId', in: 'path', required: true, schema: { type: 'string' }, description: '多个用逗号分隔' }],
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/record': {
        post: {
          summary: '新增审批记录',
          tags: ['oa/record'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalRecord' } } } },
          responses: okResponse('ApiResult'),
        },
        put: {
          summary: '修改审批记录',
          tags: ['oa/record'],
          security,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApprovalRecord' } } } },
          responses: okResponse('ApiResult'),
        },
      },
      '/oa/record/export': {
        post: {
          summary: '导出审批记录 Excel',
          tags: ['oa/record'],
          security,
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Excel文件流' } },
        },
      },
    };
  }
}

module.exports = SwaggerService;
