-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单', '3', '1', 'purchase', 'oa/purchase/index', 1, 0, 'C', '0', '0', 'oa:purchase:list', '#', 'admin', sysdate(), '', null, '采购申请单菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'oa:purchase:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'oa:purchase:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'oa:purchase:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'oa:purchase:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('采购申请单导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'oa:purchase:export',       '#', 'admin', sysdate(), '', null, '');
