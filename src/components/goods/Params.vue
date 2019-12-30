<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：仅允许为三级分类设置参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cascaderCateProps"
            @change="cascaderChanged"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 静态、动态数据 标签页 -->
      <el-row>
        <el-col>
          <el-tabs v-model="tabActiveName" @tab-click="handelTabClick">
            <!-- 添加动态参数面板 -->
            <el-tab-pane label="动态参数" name="many">
              <!-- 添加参数按钮 -->
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="addDataDialogVisible = true"
                >添加参数</el-button
              >
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template v-slot="scope">
                    <!-- 循环渲染 tag 标签 -->
                    <el-tag
                      closable
                      v-for="(item, i) in scope.row.attr_vals"
                      :key="i"
                      @close="handelTagClosed(i, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <!-- 输入文本框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                      >+ New Tag</el-button
                    >
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template v-slot="scope">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-edit"
                      @click="showEditDialog(scope.row.attr_id)"
                      >修改</el-button
                    >
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                      @click="removeDataById(scope.row.attr_id)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only">
              <!-- 添加属性按钮 -->
              <el-button
                type="primary"
                size="mini"
                :disabled="isBtnDisabled"
                @click="addDataDialogVisible = true"
                >添加属性</el-button
              >
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template v-slot="scope">
                    <!-- 循环渲染 tag 标签 -->
                    <el-tag
                      closable
                      v-for="(item, i) in scope.row.attr_vals"
                      :key="i"
                      @close="handelTagClosed(i, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <!-- 输入文本框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                      >+ New Tag</el-button
                    >
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="属性名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template v-slot="scope">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-edit"
                      @click="showEditDialog(scope.row.attr_id)"
                      >修改</el-button
                    >
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                      @click="removeDataById(scope.row.attr_id)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <!-- 添加参数、属性对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDataDialogVisible"
        width="50%"
        @close="addDataDialogClosed"
      >
        <el-form
          :model="addDataForm"
          :rules="addDataFormRules"
          ref="addDataFormRef"
          label-width="100px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addDataForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDataDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数、属性对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDataDialogVisible"
        width="50%"
        @close="editDataDialogClosed"
      >
        <el-form
          :model="editDataForm"
          :rules="editDataFormRules"
          ref="editDataFormRef"
          label-width="100px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editDataForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDataDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类数据列表
      cateList: [],
      // 级联选择框 配置对象
      cascaderCateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框选中的ID 数组
      selectedCateKeys: [],
      // 被激活的 标签页 name 值
      tabActiveName: 'many',
      // 动态参数数据列表
      manyTableData: [],
      // 静态属性数据列表
      onlyTableData: [],
      // 添加数据对话框
      addDataDialogVisible: false,
      // 添加数据对话框表单验证
      addDataFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 添加数据列表
      addDataForm: {
        attr_name: ''
      },
      // 控制修改对话框显示隐藏
      editDataDialogVisible: false,
      // 修改数据对话框表单验证
      editDataFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 修改数据列表
      editDataForm: {}
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取 、更新 分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.cateList = res.data
    },
    // 级联选择框选中项 改变 触发此事件
    cascaderChanged() {
      this.getParamsList()
    },
    // 标签页 点击事件
    handelTabClick() {
      this.getParamsList()
    },
    // 获取 、 更新参数列表
    async getParamsList() {
      // 验证 选中的是不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$message.info('请选择三级分类！')
        return
      }
      // 根据 级联选择框 所选三级分类 id 值和标签页所处的面板 获取对应参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.tabActiveName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 将展开行 参数字符串 以 空格 分割成数组，并重新赋值给attr_vals
      res.data.forEach(item => {
        // 解决 展开行为空的显示 bug
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制 展开列 文本框显示与隐藏
        item.inputVisible = false
        // 展开列 文本框中输入内容
        item.inputValue = ''
      })

      // 通过 tabActiveName 分别在 data 中挂载 动态参数、静态属性 数据列表
      if (this.tabActiveName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加表单数据
    addParams() {
      this.$refs.addDataFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addDataForm.attr_name,
            attr_sel: this.tabActiveName
          }
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDataDialogVisible = false
        this.getParamsList()
      })
    },
    // 关闭添加对话框重置数据
    addDataDialogClosed() {
      this.$refs.addDataFormRef.resetFields()
    },
    // 展示修改对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.tabActiveName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.editDataForm = res.data
      this.editDataDialogVisible = true
    },
    // 关闭编辑对话框重置数据
    editDataDialogClosed() {
      this.$refs.editDataFormRef.resetFields()
    },
    // 修改参数信息
    editParams() {
      this.$refs.editDataFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editDataForm.attr_id}`,
          {
            attr_name: this.editDataForm.attr_name,
            attr_sel: this.tabActiveName
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

        this.$message.success(res.meta.msg)
        this.editDataDialogVisible = false
        this.getParamsList()
      })
    },
    // 删除数据信息
    async removeDataById(attrId) {
      const confirm = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'cancel') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getParamsList()
    },
    // 展开列中 删除 tag标签
    handelTagClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValues(row)
    },
    // 展开列中 文本框 失去焦点、按下 enter 键，触发事件
    handleInputConfirm(row) {
      // 优化文本框内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 现在客户端 生成数据，然后将数据转义为字符串提交给客户端
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.saveAttrValues(row)
    },
    // 展开列中 点击按钮，展示文本框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获取焦点
      // $nextTick : 当页面上元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 展开列中 同步 tag 标签数据到数据库
    async saveAttrValues(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.$message.success(res.meta.msg)
    }
  },
  computed: {
    // 判断 是否禁用按钮
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3
    },
    // 获取 级联框选中 三级分类 id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态生成 标题文本
    titleText() {
      if (this.tabActiveName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
