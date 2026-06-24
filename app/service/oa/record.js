/*
 * @Description: 审批记录服务层
 * @Author: 姜彦汐
 * @Date: 2026-06-22
 */

const Service = require('egg').Service;

class OaApprovalRecordService extends Service {

  /**
   * 查询审批记录列表（分页）
   * @param {object} params - 查询参数
   * @return {object} 查询结果
   */
  async selectOaApprovalRecordList(params = {}) {
    const { ctx } = this;
    const mapper = ctx.helper.getDB(ctx).oaApprovalRecordMapper;

    return await ctx.helper.pageQuery(
      mapper.selectOaApprovalRecordListMapper([], params),
      params,
      mapper.db()
    );
  }

  /**
   * 查询审批记录详情
   * @param {Number} recordId - 记录ID
   * @return {object} 审批记录信息
   */
  async selectOaApprovalRecordByRecordId(recordId) {
    const { ctx } = this;

    return await ctx.helper.getDB(ctx).oaApprovalRecordMapper.selectOaApprovalRecordByRecordId([],{recordId});
  }

  /**
   * 新增审批记录
   * @param {object} data - 审批记录信息
   * @return {object} 新增结果
   */
  async insertOaApprovalRecord(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.insertOaApprovalRecord([],data);

    return { code: 200, msg: '新增成功', data: result };
  }

  /**
   * 修改审批记录
   * @param {object} data - 审批记录信息
   * @return {object} 修改结果
   */
  async updateOaApprovalRecord(data) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.updateOaApprovalRecord([],data);

    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除审批记录
   * @param {array} recordIds - 记录ID数组
   * @return {object} 删除结果
   */
  async deleteOaApprovalRecordByRecordIds(recordIds) {
    const { ctx } = this;

    const result = await ctx.helper.getMasterDB(ctx).oaApprovalRecordMapper.deleteOaApprovalRecordByRecordIds([],{array:recordIds});

    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = OaApprovalRecordService;
