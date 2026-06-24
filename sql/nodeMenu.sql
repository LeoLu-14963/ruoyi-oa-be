-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置', '3', '1', 'node', 'oa/node/index', 1, 0, 'C', '0', '0', 'oa:node:list', '#', 'admin', sysdate(), '', null, '审批节点配置菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'oa:node:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'oa:node:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'oa:node:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'oa:node:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('审批节点配置导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'oa:node:export',       '#', 'admin', sysdate(), '', null, '');
