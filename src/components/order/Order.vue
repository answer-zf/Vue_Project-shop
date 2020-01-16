<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 对我而言，好人是一个贬义词，一个人一个房间是一种幸福，不想因为年龄而结婚，更不想负了朋友家人对我的关心，哎，回家倒计时中-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="searchKey">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchKey: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        user_id: '',
        pay_status: '',
        is_send: '',
        order_fapiao_title: '',
        order_fapiao_company: '',
        order_fapiao_content: '',
        consignee_addr: ''
      }
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss" scoped></style>
