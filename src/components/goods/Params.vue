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
        title="注意：仅允许为第三级分类设置参数！"
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
              <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                >添加参数</el-button
              >
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand"> </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template v-slot="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit"
                      >修改</el-button
                    >
                    <el-button type="danger" size="mini" icon="el-icon-delete"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only">
              <!-- 添加属性按钮 -->
              <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                >添加属性</el-button
              >
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand"> </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="属性名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template v-slot="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit"
                      >修改</el-button
                    >
                    <el-button type="danger" size="mini" icon="el-icon-delete"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
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
      onlyTableData: []
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
      console.log(this.tabActiveName)
    },
    async getParamsList() {
      // 验证 选中的是不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
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
      // 通过 tabActiveName 分别在 data 中挂载 动态参数、静态属性 数据列表
      if (this.tabActiveName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    }
  },
  computed: {
    // 判断 是否禁用按钮
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}
</style>
