/*
 * @Description: 通用审批引擎
 *   提供提交审批、审批操作（通过/驳回）、查询审批记录的通用逻辑
 *   通过 typeCode 关联业务类型 -> 流程 -> 节点链
 *   各业务 service 只需传入 typeCode + businessId 即可复用
 * @Author: 愚者
 * @Date: 2026-07-28
 */

const Service = require('egg').Service;

class ApprovalEngineService extends Service {

  /**
   * 获取业务类型配置（含绑定的流程）
   * @param {string} typeCode - 业务编码
   * @return {object} 业务类型配置
   */
  async getBusinessTypeConfig(typeCode) {
    const { ctx } = this;

    const result = await ctx.helper.getDB(ctx).oaBusinessTypeMapper.selectOaBusinessTypeByTypeCode([], { typeCode });
    const config = Array.isArray(result) ? result[0] : result;

    if (!config) {
      throw new Error(`业务类型不存在: ${typeCode}`);
    }

    if (config.status !== '1') {
      throw new Error(`业务类型未启用: ${typeCode}`);
    }

    if (!config.flowId) {
      throw new Error(`业务类型未绑定审批流程: ${typeCode}`);
    }

    return config;
  }

  /**
   * 查询流程下所有节点（按顺序）
   * @param {Number} flowId - 流程ID
   * @return {array} 节点列表
   */
  async getFlowNodes(flowId) {
    return await this.ctx.service.oa.flowNodeRel.selectNodesByFlowId(flowId);
  }

  /**
   * 根据节点配置获取下一审批人
   * 支持三种审批类型：1=按角色 2=按人员 3=按部门
   * @param {object} node - 节点信息（含 approvalType, approverIds, roleId, deptId）
   * @return {object} { approverId, approverName } 审批人信息
   */
  async getNextApprover(node, currentUserId = null) {
    const { ctx } = this;
    const db = this.app.mysql.get('ruoyi');
    let approverId = null;
    let approverName = null;

    const approvalType = String(node.approvalType);
    let users = [];

    if (approvalType === '1' && node.roleId) {
      // 按角色：查该角色下所有状态正常的用户
      users = await db.selects(
        `SELECT u.user_id, u.user_name, u.nick_name FROM sys_user u
         INNER JOIN sys_user_role ur ON u.user_id = ur.user_id
         WHERE ur.role_id = ${node.roleId} AND u.status = '0' AND u.del_flag = '0'
         ORDER BY u.user_id ASC`
      );
    } else if (approvalType === '2' && node.approverIds) {
      // 按人员
      const idList = String(node.approverIds).split(',').map(s => s.trim()).filter(Boolean);
      if (idList.length > 0) {
        users = await db.selects(
          `SELECT user_id, user_name, nick_name FROM sys_user
           WHERE user_id IN (${idList.join(',')}) AND status = '0' AND del_flag = '0'
           ORDER BY user_id ASC`
        );
      }
    } else if (approvalType === '3' && node.deptId) {
      // 按部门
      users = await db.selects(
        `SELECT user_id, user_name, nick_name FROM sys_user
         WHERE dept_id = ${node.deptId} AND status = '0' AND del_flag = '0'
         ORDER BY user_id ASC`
      );
    }

    if (users && users.length > 0) {
      // 优先选非当前操作人的用户，避免审批人流转到自己
      const other = users.find(u => String(u.userId) !== String(currentUserId));
      const chosen = other || users[0];
      approverId = chosen.userId;
      approverName = chosen.nickName || chosen.userName;
    }

    return { approverId, approverName };
  }

  /**
   * 提交审批
   * @param {object} options
   * @param {string} options.typeCode - 业务编码
   * @param {Number} options.businessId - 业务ID
   * @param {string} options.businessName - 业务名称（用于审批记录）
   * @param {object} options.updateData - 要更新的业务表字段（status, currentNodeId, currentApproverId 等）
   * @param {function} options.updateFn - 更新业务表的函数 (db, data) => Promise
   * @return {object} 结果
   */
  async submit({ typeCode, businessId, updateData, updateFn }) {
    const { ctx } = this;
    const userName = ctx.state.user.userName;
    const userId = ctx.state.user.userId;

    // 1. 获取业务类型配置
    const config = await this.getBusinessTypeConfig(typeCode);

    // 2. 查询流程节点
    const allNodes = await this.getFlowNodes(config.flowId);
    if (!allNodes || allNodes.length === 0) {
      return { code: 500, msg: '审批流程未配置节点' };
    }

    // 3. 找第一个审批节点（跳过发起 0 和结束 4）
    const firstApprovalNode = allNodes.find(n => n.nodeType === '1');
    if (!firstApprovalNode) {
      return { code: 500, msg: '审批流程未配置审批节点' };
    }

    // 4. 获取第一个审批节点的审批人
    const { approverId, approverName } = await this.getNextApprover(firstApprovalNode, userId);

    // 5. 更新业务表
    const data = {
      ...updateData,
      status: '2', // 审批中
      currentNodeId: firstApprovalNode.nodeId,
      currentNodeName: firstApprovalNode.nodeName,
      currentApproverId: approverId,
      updateBy: userName,
    };
    const db = ctx.helper.getMasterDB(ctx);
    if (updateFn) {
      await updateFn(db, data);
    }

    // 5. 写入审批记录（提交动作，记在发起节点）
    const startNode = allNodes.find(n => n.nodeType === '0') || allNodes[0];
    await db.oaApprovalRecordMapper.insertOaApprovalRecord([], {
      businessId,
      businessType: typeCode,
      nodeId: startNode.nodeId,
      nodeName: startNode.nodeName,
      approverId: userId,
      approverName: userName,
      action: '1', // 提交
      opinion: '提交审批',
      createBy: userName,
    });

    return { code: 200, msg: '提交审批成功' };
  }

  /**
   * 审批操作（通过/驳回）
   * @param {object} options
   * @param {string} options.typeCode - 业务编码
   * @param {Number} options.businessId - 业务ID
   * @param {string} options.action - 动作（2通过 3驳回）
   * @param {string} options.opinion - 审批意见
   * @param {object} options.fields - 要回填的业务字段（各阶段专业字段）
   * @param {object} options.currentNodeId - 当前节点ID（从业务表获取）
   * @param {function} options.updateFn - 更新业务表的函数 (db, data) => Promise
   * @return {object} 结果
   */
  async approve({ typeCode, businessId, action, opinion, fields, currentNodeId, updateFn }) {
    const { ctx } = this;
    const userName = ctx.state.user.userName;
    const userId = ctx.state.user.userId;

    // 1. 获取业务类型配置
    const config = await this.getBusinessTypeConfig(typeCode);

    // 2. 查询流程节点
    const allNodes = await this.getFlowNodes(config.flowId);
    const sortedNodes = allNodes || [];
    const currentIdx = sortedNodes.findIndex(n => String(n.nodeId) === String(currentNodeId));

    if (currentIdx === -1) {
      return { code: 500, msg: '当前节点不在流程中' };
    }

    const currentNode = sortedNodes[currentIdx];

    // 3. 准备更新数据
    const updateData = {
      ...fields,
      updateBy: userName,
    };

    const db = ctx.helper.getMasterDB(ctx);

    if (action === '2') {
      // ===== 通过 =====
      const nextIdx = currentIdx + 1;
      if (nextIdx >= sortedNodes.length) {
        return { code: 500, msg: '已是最后节点，无法继续' };
      }
      const nextNode = sortedNodes[nextIdx];

      if (nextNode.nodeType === '4') {
        // 下一节点是结束 -> 审批完成
        updateData.status = '3'; // 已通过
        updateData.currentNodeId = null;
        updateData.currentNodeName = null;
        updateData.currentApproverId = null;
      } else {
        // 推进到下一审批节点，从节点配置获取审批人
        const nextApprover = await this.getNextApprover(nextNode, userId);
        updateData.status = '2';
        updateData.currentNodeId = nextNode.nodeId;
        updateData.currentNodeName = nextNode.nodeName;
        updateData.currentApproverId = nextApprover.approverId;
      }

      if (updateFn) {
        await updateFn(db, updateData);
      }

      // 写入审批记录
      await db.oaApprovalRecordMapper.insertOaApprovalRecord([], {
        businessId,
        businessType: typeCode,
        nodeId: currentNode.nodeId,
        nodeName: currentNode.nodeName,
        approverId: userId,
        approverName: userName,
        action: '2', // 通过
        opinion: opinion || '审批通过',
        createBy: userName,
      });

      return { code: 200, msg: nextNode.nodeType === '4' ? '审批完成，已通过' : `审批通过，下一节点：${nextNode.nodeName}` };

    } else if (action === '3') {
      // ===== 驳回 =====
      updateData.status = '4'; // 已驳回
      updateData.currentNodeId = null;
      updateData.currentNodeName = null;
      updateData.currentApproverId = null;

      if (updateFn) {
        await updateFn(db, updateData);
      }

      await db.oaApprovalRecordMapper.insertOaApprovalRecord([], {
        businessId,
        businessType: typeCode,
        nodeId: currentNode.nodeId,
        nodeName: currentNode.nodeName,
        approverId: userId,
        approverName: userName,
        action: '3', // 驳回
        opinion: opinion || '审批驳回',
        createBy: userName,
      });

      return { code: 200, msg: '已驳回' };

    } else {
      return { code: 500, msg: '不支持的操作类型，action 只能是 2(通过) 或 3(驳回)' };
    }
  }

  /**
   * 查询业务审批记录
   * @param {string} typeCode - 业务编码
   * @param {Number} businessId - 业务ID
   * @return {object} 审批记录列表
   */
  async getRecords(typeCode, businessId) {
    const { ctx } = this;

    const records = await ctx.helper.getDB(ctx).oaApprovalRecordMapper.selectOaApprovalRecordList([], {
      businessId,
      businessType: typeCode,
    });

    return { code: 200, msg: '查询成功', data: records || [] };
  }
}

module.exports = ApprovalEngineService;
