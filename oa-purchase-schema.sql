-- =====================================================
-- 采购审批管理系统 - 数据库设计
-- 数据库: ruoyi_oa
-- 设计日期: 2026-06-20
-- 更新: 2026-07-28 审批节点改为通用节点池模式
-- =====================================================

-- =====================================================
-- 1. 供应商管理表
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_supplier` (
  `supplier_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
  `supplier_code` VARCHAR(50) NOT NULL COMMENT '供应商编码',
  `supplier_name` VARCHAR(200) NOT NULL COMMENT '供应商名称',
  `supplier_type` VARCHAR(50) NOT NULL COMMENT '供应商类型',
  `contact_name` VARCHAR(100) DEFAULT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `contact_email` VARCHAR(100) DEFAULT NULL COMMENT '联系邮箱',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '地址',
  `credit_code` VARCHAR(50) DEFAULT NULL COMMENT '统一社会信用代码',
  `bank_name` VARCHAR(200) DEFAULT NULL COMMENT '开户银行',
  `bank_account` VARCHAR(50) DEFAULT NULL COMMENT '银行账号',
  `status` CHAR(1) NOT NULL DEFAULT '0' COMMENT '状态(0正常1停用)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `uk_supplier_code` (`supplier_code`),
  KEY `idx_supplier_name` (`supplier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='供应商管理表';

-- =====================================================
-- 2. 采购申请单表（主表）
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_purchase` (
  `purchase_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '采购申请ID',
  `purchase_code` VARCHAR(50) NOT NULL COMMENT '采购单号',
  `title` VARCHAR(200) NOT NULL COMMENT '申请标题',
  `purchase_type` VARCHAR(50) NOT NULL COMMENT '采购类型',
  `apply_dept_id` BIGINT(20) DEFAULT NULL COMMENT '申请部门ID',
  `apply_user_id` BIGINT(20) DEFAULT NULL COMMENT '申请人ID',
  `apply_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `urgency` CHAR(1) NOT NULL DEFAULT '0' COMMENT '紧急程度(0普通1紧急2特急)',
  `required_date` DATE DEFAULT NULL COMMENT '需求日期',
  `estimated_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '预估金额',
  `reason` TEXT COMMENT '申请理由',
  `attachment_url` VARCHAR(500) DEFAULT NULL COMMENT '附件地址',
  `status` CHAR(1) NOT NULL DEFAULT '0' COMMENT '状态(0草稿1待审批2审批中3已通过4已驳回5已完成)',
  `current_node_id` BIGINT(20) DEFAULT NULL COMMENT '当前审批节点ID',
  `current_approver_id` BIGINT(20) DEFAULT NULL COMMENT '当前审批人ID',
  `process_instance_id` VARCHAR(100) DEFAULT NULL COMMENT '流程实例ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`purchase_id`),
  UNIQUE KEY `uk_purchase_code` (`purchase_code`),
  KEY `idx_apply_user` (`apply_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='采购申请单表';

-- =====================================================
-- 3. 采购明细表（从表）
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_purchase_detail` (
  `detail_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `purchase_id` BIGINT(20) NOT NULL COMMENT '采购申请ID',
  `item_name` VARCHAR(200) NOT NULL COMMENT '物品名称',
  `item_code` VARCHAR(50) DEFAULT NULL COMMENT '物品编码',
  `item_type` VARCHAR(50) DEFAULT NULL COMMENT '物品类型',
  `specification` VARCHAR(200) DEFAULT NULL COMMENT '规格型号',
  `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位',
  `quantity` INT(11) NOT NULL COMMENT '数量',
  `unit_price` DECIMAL(12,2) DEFAULT NULL COMMENT '单价',
  `total_price` DECIMAL(12,2) DEFAULT NULL COMMENT '总价',
  `supplier_id` BIGINT(20) DEFAULT NULL COMMENT '建议供应商ID',
  `purpose` VARCHAR(500) DEFAULT NULL COMMENT '用途说明',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`detail_id`),
  KEY `idx_purchase_id` (`purchase_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='采购明细表';

-- =====================================================
-- 4. 审批流程配置表
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_approval_flow` (
  `flow_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '流程ID',
  `flow_code` VARCHAR(50) NOT NULL COMMENT '流程编码',
  `flow_name` VARCHAR(200) NOT NULL COMMENT '流程名称',
  `flow_type` VARCHAR(50) NOT NULL COMMENT '流程类型',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '流程描述',
  `status` CHAR(1) NOT NULL DEFAULT '0' COMMENT '状态(0草稿1启用2停用)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`flow_id`),
  UNIQUE KEY `uk_flow_code` (`flow_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批流程配置表';

-- =====================================================
-- 5. 审批节点配置表（通用节点池，不再隶属流程）
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_approval_node` (
  `node_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '节点ID',
  `node_code` VARCHAR(50) NOT NULL COMMENT '节点编码',
  `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
  `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型(0发起1审批2会签3或签4结束)',
  `approval_type` VARCHAR(50) NOT NULL COMMENT '审批类型(1角色2人员3部门)',
  `approver_ids` VARCHAR(500) DEFAULT NULL COMMENT '审批人ID列表，逗号分隔',
  `role_id` BIGINT(20) DEFAULT NULL COMMENT '审批角色ID',
  `dept_id` BIGINT(20) DEFAULT NULL COMMENT '审批部门ID',
  `approval_decision` VARCHAR(500) DEFAULT NULL COMMENT '审批意见模板',
  `can_reject` CHAR(1) NOT NULL DEFAULT '1' COMMENT '是否可驳回(0否1是)',
  `can_modify` CHAR(1) NOT NULL DEFAULT '0' COMMENT '是否可修改(0否1是)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`node_id`),
  UNIQUE KEY `uk_node_code` (`node_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批节点配置表（通用节点池）';

-- =====================================================
-- 5.1 流程-节点关联表（多对多）
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_flow_node_rel` (
  `rel_id`      BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `flow_id`     BIGINT(20) NOT NULL COMMENT '流程ID',
  `node_id`     BIGINT(20) NOT NULL COMMENT '节点ID',
  `node_order`  INT(11) NOT NULL COMMENT '在该流程中的顺序',
  `create_by`   VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`rel_id`),
  UNIQUE KEY `uk_flow_node` (`flow_id`, `node_id`),
  KEY `idx_flow_id` (`flow_id`),
  KEY `idx_node_id` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='流程-节点关联表';

-- =====================================================
-- 6. 审批记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_approval_record` (
  `record_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `business_id` BIGINT(20) NOT NULL COMMENT '业务ID',
  `business_type` VARCHAR(50) NOT NULL COMMENT '业务类型',
  `node_id` BIGINT(20) DEFAULT NULL COMMENT '节点ID',
  `node_name` VARCHAR(200) DEFAULT NULL COMMENT '节点名称',
  `approver_id` BIGINT(20) DEFAULT NULL COMMENT '审批人ID',
  `approver_name` VARCHAR(100) DEFAULT NULL COMMENT '审批人姓名',
  `approve_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '审批时间',
  `action` CHAR(1) NOT NULL COMMENT '动作(1提交2通过3驳回4会签通过5会签驳回)',
  `opinion` VARCHAR(500) DEFAULT NULL COMMENT '审批意见',
  `attachment_url` VARCHAR(500) DEFAULT NULL COMMENT '附件地址',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`record_id`),
  KEY `idx_business` (`business_type`, `business_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批记录表';

-- =====================================================
-- 7. 采购订单表（审批通过后生成）
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_purchase_order` (
  `order_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_code` VARCHAR(50) NOT NULL COMMENT '订单号',
  `purchase_id` BIGINT(20) DEFAULT NULL COMMENT '关联采购申请ID',
  `supplier_id` BIGINT(20) NOT NULL COMMENT '供应商ID',
  `order_date` DATE DEFAULT NULL COMMENT '订单日期',
  `delivery_date` DATE DEFAULT NULL COMMENT '交货日期',
  `total_amount` DECIMAL(12,2) NOT NULL COMMENT '订单总金额',
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT '付款方式',
  `payment_terms` VARCHAR(500) DEFAULT NULL COMMENT '付款条件',
  `delivery_address` VARCHAR(500) DEFAULT NULL COMMENT '送货地址',
  `status` CHAR(1) NOT NULL DEFAULT '0' COMMENT '状态(0待确认1已确认2已发货3已收货4已取消)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_code` (`order_code`),
  KEY `idx_purchase_id` (`purchase_id`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='采购订单表';

-- =====================================================
-- 8. 采购订单明细表
-- =====================================================
CREATE TABLE IF NOT EXISTS `oa_purchase_order_detail` (
  `detail_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` BIGINT(20) NOT NULL COMMENT '订单ID',
  `item_name` VARCHAR(200) NOT NULL COMMENT '物品名称',
  `specification` VARCHAR(200) DEFAULT NULL COMMENT '规格型号',
  `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位',
  `quantity` INT(11) NOT NULL COMMENT '数量',
  `unit_price` DECIMAL(12,2) DEFAULT NULL COMMENT '单价',
  `total_price` DECIMAL(12,2) DEFAULT NULL COMMENT '总价',
  `received_quantity` INT(11) DEFAULT NULL COMMENT '已收数量',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`detail_id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='采购订单明细表';

-- =====================================================
-- 初始化一些测试数据
-- =====================================================

-- 插入供应商测试数据
INSERT INTO `oa_supplier` (`supplier_code`, `supplier_name`, `supplier_type`, `contact_name`, `contact_phone`, `status`) VALUES
('SUP2026060001', '深圳科技有限公司', '生产企业', '张三', '13800138000', '0'),
('SUP2026060002', '广州贸易公司', '贸易公司', '李四', '13900139000', '0'),
('SUP2026060003', '北京办公用品厂', '生产企业', '王五', '13700137000', '0');

-- 插入审批流程配置
INSERT INTO `oa_approval_flow` (`flow_code`, `flow_name`, `flow_type`, `status`) VALUES
('FLOW_PURCHASE', '采购审批流程', 'PURCHASE', '1');

-- 插入通用审批节点（节点池，不隶属任何流程）
INSERT INTO `oa_approval_node` (`node_code`, `node_name`, `node_type`, `approval_type`, `role_id`, `can_reject`, `can_modify`) VALUES
('NODE_APPLY', '提交申请', '0', '2', NULL, '0', '1'),
('NODE_DEPT_LEADER', '部门经理审批', '1', '1', 2, '1', '0'),
('NODE_FINANCE', '财务审批', '1', '1', 3, '1', '0'),
('NODE_GM', '总经理审批', '1', '1', 4, '1', '0'),
('NODE_COMPLETE', '完成', '4', '2', NULL, '0', '0');

-- 将节点组装到采购审批流程（通过关联表建立多对多关系）
INSERT INTO `oa_flow_node_rel` (`flow_id`, `node_id`, `node_order`) VALUES
(1, 1, 1),  -- 提交申请
(1, 2, 2),  -- 部门经理审批
(1, 3, 3),  -- 财务审批
(1, 4, 4),  -- 总经理审批
(1, 5, 5);  -- 完成

-- =====================================================
-- 完成！
-- =====================================================
