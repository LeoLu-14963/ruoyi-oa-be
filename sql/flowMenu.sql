-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置', '3', '1', 'flow', 'oa/flow/index', 1, 0, 'C', '0', '0', 'oa:flow:list', '#', 'admin', sysdate(), '', null, '审批流程配置菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'oa:flow:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'oa:flow:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'oa:flow:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'oa:flow:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批流程配置导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'oa:flow:export',       '#', 'admin', sysdate(), '', null, '');
