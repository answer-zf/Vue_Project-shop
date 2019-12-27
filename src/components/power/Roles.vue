<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bd-bottom', i1 === 0 ? 'bd-top' : '', 'v-center']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bd-top', 'v-center']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i
                  ></el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      @close="addRoleDialogClosed"
      width="50%"
    >
      <el-form
        :model="addRoleList"
        :rules="addRoleRules"
        ref="addRoleRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色 对话框 -->
    <el-dialog
      title="编辑橘色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialog"
    >
      <el-form
        :model="editRoleList"
        :rules="editRoleRules"
        ref="editRoleRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制权限对话框 显示与隐藏
      setRightDialogVisible: false,
      // 所有权限列表数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点 ID 值数组
      defKeys: [],
      // 点击分配权限，当前角色的 ID 值
      roleId: '',
      // 控制 添加角色对话框 显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色数据列表：
      addRoleList: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [{ max: 15, message: '长度小于 15 个字符', trigger: 'blur' }]
      },
      // 控制 编辑角色对话框 显示与隐藏
      editRoleDialogVisible: false,
      // 编辑角色对话框 数据列表
      editRoleList: [],
      // 编辑角色验证规则
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [{ max: 15, message: '长度小于 15 个字符', trigger: 'blur' }]
      },
      // 点击编辑角色，当前角色 ID 值
      editId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.rolesList = res.data
    },
    // 点击标签 X按钮 删除权限
    async removeRightById(role, rightId) {
      // 弹框提示是否确定删除
      const confirm = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'cancel') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      role.children = res.data
    },
    // 展示 权限分配对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message(res.meta.msg)
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 递归 选中节点的id值(三级权限的id值)，同步到 defkeys 数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭权限分配对话框 重置数据
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击确认 为角色分配权限
    async allotRights() {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = arr.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.setRightDialogVisible = false
      this.getRolesList()
    },
    // 点击确认 添加角色
    saveAddRoleInfo() {
      // 提交前预校验
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleList)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 关闭添加角色对话框，重置表单
    addRoleDialogClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 展示编辑角色对话框
    async showEditRoleDialog(id) {
      this.editId = id
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRoleList = res.data
      this.editRoleDialogVisible = true
    },
    // 点击确认修改角色信息
    saveEditRoleInfo() {
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `roles/${this.editId}`,
          this.editRoleList
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.editRoleDialogVisible = false
      })
    },
    // 关闭编辑角色对话框，重置表单
    editRoleDialog() {
      this.$refs.editRoleRef.resetFields()
    },
    // 删除角色
    async removeRoleById(id) {
      // 弹框询问是否确认
      const confirm = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'cancel') return this.$message.info('取消删除操作！')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.v-center {
  display: flex;
  align-items: center;
}
</style>
