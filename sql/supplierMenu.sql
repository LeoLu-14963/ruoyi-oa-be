-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理', '3', '1', 'supplier', 'oa/supplier/index', 1, 0, 'C', '0', '0', 'oa:supplier:list', '#', 'admin', sysdate(), '', null, '供应商管理菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'oa:supplier:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'oa:supplier:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'oa:supplier:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'oa:supplier:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('供应商管理导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'oa:supplier:export',       '#', 'admin', sysdate(), '', null, '');
