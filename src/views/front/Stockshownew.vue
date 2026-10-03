<template>
  <div class="stock-shownew">
    <el-dialog title="板块筛选" :visible.sync="showFilterPanel" width="600px" class="bk-dialog">
      <el-radio-group v-model="bkType" style="margin-bottom: 20px;">
        <el-radio-button label="hy">行业板块</el-radio-button>
        <el-radio-button label="gn">概念板块</el-radio-button>
      </el-radio-group>

      <div v-if="bkType === 'hy'" class="bk-btn-group" style="margin-bottom: 10px;">
        <el-button size="mini" @click="selectAllBkhy">全选</el-button>
        <el-button size="mini" @click="reverseSelectBkhy">反选</el-button>
        <el-button size="mini" @click="clearSelectBkhy">取消</el-button>
      </div>
      <el-checkbox-group v-if="bkType === 'hy'" v-model="selectedBkhy" class="bk-checkbox-group">
        <el-checkbox
          v-for="item in bkhyOptions"
          :label="item.bk_code"
          :key="item.bk_code"
        >
          <span :style="{ color: item.zycd === 2 ? 'red' : (item.zycd === 1 ? 'blue' : 'inherit') }">{{ item.bk_name }}</span>
        </el-checkbox>
      </el-checkbox-group>

      <div v-if="bkType === 'gn'" class="bk-btn-group" style="margin-bottom: 10px;">
        <el-button size="mini" @click="selectAllBkgn">全选</el-button>
        <el-button size="mini" @click="reverseSelectBkgn">反选</el-button>
        <el-button size="mini" @click="clearSelectBkgn">取消</el-button>
      </div>
      <el-checkbox-group v-if="bkType === 'gn'" v-model="selectedBkgn" class="bk-checkbox-group">
        <el-checkbox
          v-for="item in bkgnOptions"
          :label="item.bk_code"
          :key="item.bk_code"
        >
          <span :style="{ color: item.zycd === 2 ? 'red' : item.zycd === 1 ? 'blue' : 'inherit' }">{{ item.bk_name }}</span>
        </el-checkbox>
      </el-checkbox-group>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showFilterPanel = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFilter">确认</el-button>
      </div>
    </el-dialog>

    <!-- 共享筛选条件（单独区域） -->
    <div class="filter-card">
      <div class="panel-header">
        <span>筛选条件</span>
        <div>
          <el-button type="text" @click="zbFilterCollapsed = !zbFilterCollapsed">{{ zbFilterCollapsed ? '展开' : '收起' }}</el-button>
          <el-button type="text" @click="showDebug = !showDebug" style="margin-left:8px;">{{ showDebug ? '关闭调试' : '开启调试' }}</el-button>
        </div>
      </div>
      <transition name="el-zoom-in-top">
        <div v-show="!zbFilterCollapsed" class="filter-panel">
          <el-row :gutter="6" class="filter-row">
            <el-col :span="3">
              <span class="filter-label">涨跌幅(%)：</span>
              <el-input v-model="searchParams.changpercent" size="mini" placeholder="涨跌幅 ≥ (%)" style="width:120px;" @keydown.enter.native.prevent />
            </el-col>
            <el-col :span="3">
              <span class="filter-label">成交额(亿)：</span>
              <el-input v-model="searchParams.tradingamount_dw" size="mini" placeholder="成交额 ≥ (亿)" style="width:120px;" @keydown.enter.native.prevent />
            </el-col>
            <el-col :span="3">
              <span class="filter-label">成交倍数：</span>
              <el-input v-model="searchParams.cjbl" size="mini" placeholder="成交倍数 ≥" style="width:120px;" @keydown.enter.native.prevent />
            </el-col>
            <el-col :span="3">
              <span class="filter-label">买卖比：</span>
              <el-input v-model="searchParams.bscp" size="mini" placeholder="买卖比 ≥" style="width:120px;" @keydown.enter.native.prevent />
            </el-col>
            <el-col :span="3">
              <span class="filter-label">countnum：</span>
              <el-input v-model="searchParams.countnum" size="mini" placeholder="countnum" style="width:120px;" @keydown.enter.native.prevent />
            </el-col>
            <el-col :span="3">
              <span class="filter-label">涨停天数：</span>
              <el-select v-model="lxzttsList" multiple clearable collapse-tags size="mini" placeholder="0-10" style="width:140px;">
                <el-option v-for="n in 11" :key="n-1" :label="n-1" :value="n-1" />
              </el-select>
            </el-col>
            <el-col :span="2">
              <el-checkbox v-model="searchParams.is_new" :true-label="1" :false-label="0">是否新股</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-checkbox v-model="searchParams.is_important" :true-label="1" :false-label="0">是否重要</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-checkbox v-model="useHyFilter">行业板块</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-checkbox v-model="useGnFilter">概念板块</el-checkbox>
            </el-col>
          </el-row>
          <el-row :gutter="6" class="filter-row">
            <el-col :span="6" class="filter-panel-bk">
              <el-button @click="showFilterPanel = true" icon="el-icon-setting" size="mini">板块筛选</el-button>
            </el-col>
            <el-col :span="12" class="refresh-interval" style="justify-content:center;">
              <span class="filter-label">时间：</span>
              <span>{{ displayTime || '-' }}</span>
            </el-col>
            <el-col :span="6" class="refresh-interval right-align">
              <el-button type="primary" icon="el-icon-search" native-type="button" @click="fetchStockData" size="mini">查询</el-button>
              <el-button icon="el-icon-refresh" native-type="button" @click="resetSearch" size="mini">重置</el-button>
              <span class="filter-label" style="margin-left:8px;">间隔(秒)：</span>
              <el-input-number v-model="refreshInterval" :min="1" :max="3600" @change="handleRefreshIntervalChange" size="mini" />
              <el-button size="mini" native-type="button" style="margin-left:8px;" type="primary" @click="onStartAutoRefresh" :disabled="autoRefreshing">开始</el-button>
              <el-button size="mini" native-type="button" style="margin-left:4px;" @click="onStopAutoRefresh" :disabled="!autoRefreshing">停止</el-button>
            </el-col>
          </el-row>
        </div>
      </transition>
    </div>

    <!-- 占满剩余页面的上下分屏（主板 / 创业板） -->
    <div class="split-vertical">
      <!-- 上半：主板 -->
      <div class="pane top" :style="{ flexBasis: topPane + '%' }">
        <div class="pane-inner">
          <div class="pane-title">主板</div>
          <div v-if="showDebug" class="debug-box">
            <div>ZB 条数：{{ zbData && zbData.length || 0 }}；字段数：{{ (zbData && zbData[0] && Object.keys(zbData[0]).length) || 0 }}</div>
            <div v-if="zbData && zbData.length">首行字段：{{ Object.keys(zbData[0]).join(',') }}</div>
            <div v-else>zbData 为空</div>
          </div>
          <el-table :data="zbData" size="mini" stripe :max-height="'100%'" style="width: 100%" :default-sort="{prop: zbDefaultSort.prop, order: zbDefaultSort.order}" :cell-class-name="cellClassName" :row-class-name="rowClassName">
            <el-table-column
              v-for="field in getZbVisibleFields()"
              :key="field.prop"
              :prop="field.prop"
              :label="field.filedname"
              :min-width="getZbColumnWidth(field.prop)"
              :formatter="(field.prop === 'jj_type' || field.prop === 'yjgg') ? null : formatColumn"
              sortable
            >
              <template slot-scope="scope">
                <!-- 增减持：带 tooltip -->
                <template v-if="field.prop === 'jj_type'">
                  <template v-if="scope.row.jj_type">
                    <el-tooltip placement="top" effect="dark">
                      <div slot="content">
                        <div class="plan-item"><strong>类型：</strong>{{ scope.row.jj_type }}</div>
                        <div class="plan-item" v-for="(val, key) in planTipPairs(scope.row.jj_tip)" :key="key">
                          <strong>{{ val.label }}：</strong>{{ val.value }}
                        </div>
                      </div>
                      <el-tag size="mini">{{ scope.row.jj_type }}</el-tag>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <span>-</span>
                  </template>
                </template>
                <!-- 业绩公告：格式化显示 -->
                <template v-else-if="field.prop === 'yjgg'">
                  <span>{{ formatYjggCell(scope.row.yjgg) }}</span>
                </template>
                <!-- 行业名称：选中的重点行业高亮为红色 -->
                <template v-else-if="field.prop === 'hy_name'">
                  <span v-html="highlightHyName(scope.row.hy_name)"></span>
                </template>
                <!-- 其他通用列 -->
                <template v-else>
                  <span>{{ formatColumn(scope.row, { property: field.prop }, scope.row[field.prop]) }}</span>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 拖拽分割条 -->
      <div class="divider" @mousedown="onDividerMouseDown"></div>

      <!-- 下半：创业板 -->
      <div class="pane bottom" :style="{ flexBasis: (100 - topPane) + '%' }">
        <div class="pane-inner">
          <div class="pane-title">创业板</div>
          <div v-if="showDebug" class="debug-box">
            <div>CK 条数：{{ ckData && ckData.length || 0 }}；字段数：{{ (ckData && ckData[0] && Object.keys(ckData[0]).length) || 0 }}</div>
            <div v-if="ckData && ckData.length">首行字段：{{ Object.keys(ckData[0]).join(',') }}</div>
            <div v-else>ckData 为空</div>
          </div>
          <el-table :data="ckData" size="mini" stripe :max-height="'100%'" style="width: 100%" :default-sort="{prop: ckDefaultSort.prop, order: ckDefaultSort.order}" :cell-class-name="cellClassName" :row-class-name="rowClassName">
            <el-table-column
              v-for="field in getCkVisibleFields()"
              :key="field.prop"
              :prop="field.prop"
              :label="field.filedname"
              :min-width="getCkColumnWidth(field.prop)"
              :formatter="(field.prop === 'jj_type' || field.prop === 'yjgg') ? null : formatColumn"
              sortable
            >
              <template slot-scope="scope">
                <!-- 增减持：带 tooltip -->
                <template v-if="field.prop === 'jj_type'">
                  <template v-if="scope.row.jj_type">
                    <el-tooltip placement="top" effect="dark">
                      <div slot="content">
                        <div class="plan-item"><strong>类型：</strong>{{ scope.row.jj_type }}</div>
                        <div class="plan-item" v-for="(val, key) in planTipPairs(scope.row.jj_tip)" :key="key">
                          <strong>{{ val.label }}：</strong>{{ val.value }}
                        </div>
                      </div>
                      <el-tag size="mini">{{ scope.row.jj_type }}</el-tag>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <span>-</span>
                  </template>
                </template>
                <!-- 业绩公告：格式化显示 -->
                <template v-else-if="field.prop === 'yjgg'">
                  <span>{{ formatYjggCell(scope.row.yjgg) }}</span>
                </template>
                <!-- 行业名称：选中的重点行业高亮为红色 -->
                <template v-else-if="field.prop === 'hy_name'">
                  <span v-html="highlightHyName(scope.row.hy_name)"></span>
                </template>
                <!-- 其他通用列（含 gn_name / hy_name 等均交由 sys_htmlshow 控制） -->
                <template v-else>
                  <span>{{ formatColumn(scope.row, { property: field.prop }, scope.row[field.prop]) }}</span>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getFieldInfoByTablenameAPI,
  getAllBkgnListAPI,
  getAllBkhyListAPI,
  getStockShownewZbAPI,
  getStockShownewCkAPI
} from "../../api/index.js";

export default {
  name: "StockShowNew",
  data() {
    return {
      searchParams: {
        changpercent: null,         // 涨跌幅(%) 最小
        tradingamount_dw: null,     // 成交额(亿) 最小
        cjbl: null,                 // 成交倍数 最小
        bscp: null,                 // 买卖比 最小
        countnum: null,
        is_new: 0,
        is_important: 0,
      },
      useHyFilter: false,
      useGnFilter: false,
      showFilterPanel: false,
      bkgnOptions: [],
      bkhyOptions: [],
      selectedBkgn: [],
      selectedBkhy: [],
      bkType: "hy",
      refreshInterval: 5,
      refreshTimer: null,
      autoRefreshing: true,
      showDebug: false,
      tableHeight: 600,
      // 新增主板/创业板数据和字段
      zbData: [],
      ckData: [],
      zbFields: [],
      ckFields: [],
      zbDefaultSort: { prop: "", order: "ascending" },
      ckDefaultSort: { prop: "", order: "ascending" },
      zbFilterCollapsed: false,
      ckFilterCollapsed: false,
      displayTime: '',
      // 分割面板：上半比例（0-100），默认50%
      topPane: 50,
      dragging: false,
      dragStartY: 0,
      dragStartRatio: 50,
      lxzttsList: [],
    };
  },
  methods: {
    getZbVisibleFields() {
      return Array.isArray(this.zbFields) ? this.zbFields.filter(f => f.prop !== 'rd_datetime') : [];
    },
    getCkVisibleFields() {
      return Array.isArray(this.ckFields) ? this.ckFields.filter(f => f.prop !== 'rd_datetime') : [];
    },
    computeDisplayTime() {
      const pick = (arr) => (Array.isArray(arr) ? arr.find(r => r && r.rd_datetime) : null);
      const row = pick(this.zbData) || pick(this.ckData);
      if (!row || !row.rd_datetime) return '';
      try {
        const d = new Date(row.rd_datetime);
        if (isNaN(d.getTime())) return String(row.rd_datetime);
        const pad = n => (n < 10 ? '0' + n : '' + n);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch(e) {
        return String(row.rd_datetime);
      }
    },
    // 分别获取主板和创业板的字段
    normalizeApiList(resp) {
      // 统一把各种返回结构转成【数组】, 兼容后端把 JSON 当字符串且含 NaN 的情况
      try {
        const safeJsonParse = (str) => {
          if (typeof str !== 'string') return str;
          // 将不合法的 JSON 标记替换为 null 再解析（如 NaN/Infinity）
          const sanitized = str
            .replace(/\bNaN\b/g, 'null')
            .replace(/\bInfinity\b/g, 'null')
            .replace(/-\bInfinity\b/g, 'null');
          try { return JSON.parse(sanitized); } catch (e) { return null; }
        };

        // 0) 响应整体为字符串
        if (typeof resp === 'string') {
          const obj = safeJsonParse(resp);
          if (obj) resp = obj; else return [];
        }

        // 1) 已是数组
        if (Array.isArray(resp)) return resp;

        // 2) axios 原始响应：{ data: ... }
        if (resp && typeof resp === 'object' && 'data' in resp) {
          let d = resp.data;
          if (typeof d === 'string') d = safeJsonParse(d);
          if (Array.isArray(d)) return d;                 // { data: [...] }
          if (d && Array.isArray(d.data)) return d.data;  // { data: { data: [...] } }
          if (d && Array.isArray(d.list)) return d.list;  // { data: { list: [...] } }
          if (d && typeof d === 'object') {
            if (Array.isArray(d.data)) return d.data;
            if (Array.isArray(d.list)) return d.list;
            return [d];
          }
        }

        // 3) 直接对象：{ data: [...] } / { list: [...] } / 单对象
        if (resp && typeof resp === 'object') {
          const d = (typeof resp.data === 'string') ? safeJsonParse(resp.data) : resp.data;
          if (Array.isArray(d)) return d;
          if (Array.isArray(resp.list)) return resp.list;
          return [resp];
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('normalizeApiList error:', e);
      }
      return [];
    },
    async getFieldInfo() {
      const [zbFieldInfo, ckFieldInfo] = await Promise.all([
        getFieldInfoByTablenameAPI("stock_show"),
        getFieldInfoByTablenameAPI("stock_show"),
      ]);
      const zbArr = this.normalizeApiList(zbFieldInfo);
      const ckArr = this.normalizeApiList(ckFieldInfo);
      this.zbFields = (zbArr || []).filter(item => item.is_show === 1);
      this.ckFields = (ckArr || []).filter(item => item.is_show === 1);
      if (this.zbFields.length > 0) {
        this.zbDefaultSort.prop = this.zbFields[0].prop || "";
        this.zbDefaultSort.order = "ascending";
      }
      if (this.ckFields.length > 0) {
        this.ckDefaultSort.prop = this.ckFields[0].prop || "";
        this.ckDefaultSort.order = "ascending";
      }
    },
    hasZbField(prop) {
      return Array.isArray(this.zbFields) && this.zbFields.some(f => f.prop === prop);
    },
    hasCkField(prop) {
      return Array.isArray(this.ckFields) && this.ckFields.some(f => f.prop === prop);
    },
    async fetchBkgnOptions() {
      const response = await getAllBkgnListAPI();
      const list = this.normalizeApiList(response);
      this.bkgnOptions = Array.isArray(list) ? list : [];
      this.selectedBkgn = (this.bkgnOptions || []).filter(item => item.zycd === 2).map(item => item.bk_code);
    },
    async fetchBkhyOptions() {
      const response = await getAllBkhyListAPI();
      const list = this.normalizeApiList(response);
      this.bkhyOptions = Array.isArray(list) ? list : [];
      this.selectedBkhy = (this.bkhyOptions || []).filter(item => item.zycd === 2).map(item => item.bk_code);
    },
    formatNumber(value) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    },
    formatColumn(row, column, cellValue) {
      const prop = column && column.property;
      if (prop === 'ts_code') return String(cellValue == null ? '' : cellValue);
      // 需要展示为整数的候选字段（连续涨停天数）
      const intOnlyProps = new Set(['lxztts','lxts','limit_up_days','limitUpDays','continuous_zt_days','zt_days']);
      if (cellValue == null) return cellValue;
      if (typeof cellValue === 'number') {
        if (prop && intOnlyProps.has(prop)) return Math.trunc(cellValue);
        return this.formatNumber(cellValue);
      }
      // 遇到字符串数值也尽量转数再处理
      const num = Number(cellValue);
      if (!Number.isNaN(num)) {
        if (prop && intOnlyProps.has(prop)) return Math.trunc(num);
        return this.formatNumber(num);
      }
      return cellValue;
    },
    rowClassName({ row }) {
      try {
        const imp = row && (row.is_important === 1 || row.is_important === '1');
        const isNew = row && (row.is_new === 1 || row.is_new === '1');
        return (imp || isNew) ? 'row-red' : '';
      } catch (e) { return ''; }
    },
    cellClassName({ row, column }) {
      try {
        const prop = column && column.property;
        if (!prop) return '';
        const val = row ? row[prop] : undefined;
        const n = typeof val === 'number' ? val : Number(val);

        // 1) 连续涨停天数 >= 3 红色
        if (['lxztts','lxts','limit_up_days','limitUpDays','continuous_zt_days','zt_days'].includes(prop)) {
          if (!Number.isNaN(n) && n >= 3) return 'cell-red';
          return '';
        }
        // 2) 成交金额(亿) > 20 红色 —— 常用字段名: tradingamount_dw / cje
        if (['tradingamount_dw','cje'].includes(prop)) {
          if (!Number.isNaN(n) && n > 20) return 'cell-red';
          return '';
        }
        // 3) 换手率 > 10 —— 常用字段名: hs / turnover_rate
        if (['turnoverrate','hs','turnover_rate'].includes(prop)) {
          if (!Number.isNaN(n) && n > 10) return 'cell-red';
          return '';
        }
        // 4) 买卖比 > 2.5 —— 字段名: bscp
        if (prop === 'bscp') {
          if (!Number.isNaN(n) && n > 2.5) return 'cell-red';
          return '';
        }
        // 5) 涨跌幅 > 6 —— 字段名: changpercent / zdf
        if (['changpercent','zdf'].includes(prop)) {
          if (!Number.isNaN(n) && n > 6) return 'cell-red';
          return '';
        }
        return '';
      } catch (e) { return ''; }
    },
    getZbColumnWidth(prop) {
      if (!this.zbData || this.zbData.length === 0) return 120;
      let maxLength = this.zbData.reduce((max, row) => {
        const raw = row[prop];
        const value = (raw !== undefined && raw !== null)
          ? String(prop === 'ts_code' ? raw : this.formatNumber(raw))
          : "";
        return Math.max(max, value.length);
      }, 0);
      return Math.min(Math.max(maxLength * 14 + 40, 120), 500);
    },
    getCkColumnWidth(prop) {
      if (!this.ckData || this.ckData.length === 0) return 120;
      let maxLength = this.ckData.reduce((max, row) => {
        const raw = row[prop];
        const value = (raw !== undefined && raw !== null)
          ? String(prop === 'ts_code' ? raw : this.formatNumber(raw))
          : "";
        return Math.max(max, value.length);
      }, 0);
      return Math.min(Math.max(maxLength * 14 + 40, 120), 500);
    },
    async fetchStockData() {
      // 设置板块查询参数（行业 ∪ 概念，OR）；仅当勾选对应开关时才下发
      if (this.useHyFilter && this.selectedBkhy.length > 0) {
        this.searchParams.hy_bk_codes = this.selectedBkhy.join(",");
      } else {
        delete this.searchParams.hy_bk_codes;
      }
      if (this.useGnFilter && this.selectedBkgn.length > 0) {
        this.searchParams.gn_bk_codes = this.selectedBkgn.join(",");
      } else {
        delete this.searchParams.gn_bk_codes;
      }

      // 规范化与清理参数：未选择的布尔类条件传空字符串，数值为空也不传
      const payload = { ...this.searchParams };
      // 同时下发旧参数名以兼容旧后端（过渡期）
      if (payload.changpercent !== null && payload.changpercent !== '' && payload.changpercent !== undefined) {
        payload.zdf = payload.changpercent;
      }
      if (payload.tradingamount_dw !== null && payload.tradingamount_dw !== '' && payload.tradingamount_dw !== undefined) {
        payload.cje = payload.tradingamount_dw;
      }
      if (payload.cjbl !== null && payload.cjbl !== '' && payload.cjbl !== undefined) {
        payload.cbs = payload.cjbl;
      }
      if (payload.bscp !== null && payload.bscp !== '' && payload.bscp !== undefined) {
        payload.msbl = payload.bscp;
      }
      // bool-like: 未选择时传空字符串（后端约定：传 "" 不筛选）
      if (payload.is_new === 0 || payload.is_new === '0' || payload.is_new == null) payload.is_new = '';
      if (payload.is_important === 0 || payload.is_important === '0' || payload.is_important == null) payload.is_important = '';
      // 数值类：空值删掉（新旧键都清理）
      const numKeys = ['changpercent','tradingamount_dw','cjbl','bscp','zdf','cje','cbs','msbl','countnum'];
      numKeys.forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      // 确保 countnum 纯空字符串或全空白时也不下发
      if (payload.countnum !== undefined && String(payload.countnum).trim() === '') delete payload.countnum;
      // 空的板块参数也删掉（以防万一）
      if (!payload.hy_bk_codes) delete payload.hy_bk_codes;
      if (!payload.gn_bk_codes) delete payload.gn_bk_codes;

      // 涨停天数多选：有值则下发（逗号分隔）
      if (Array.isArray(this.lxzttsList) && this.lxzttsList.length > 0) {
        payload.lxztts_list = this.lxzttsList.join(',');
      } else {
        delete payload.lxztts_list;
      }

      try {
        // 分别请求主板和创业板
        const [zbResp, ckResp] = await Promise.all([
          getStockShownewZbAPI(payload),
          getStockShownewCkAPI(payload)
        ]);
        // 主板
        if (zbResp && zbResp.error) {
          this.$message.error("主板数据：" + zbResp.error);
          this.zbData = [];
        } else {
          const zbList = this.normalizeApiList(zbResp);
          this.zbData = Array.isArray(zbList) ? zbList : [];
        }
        this.debugLog && this.debugLog('ZB', zbResp, this.zbData);
        // 创业板
        if (ckResp && ckResp.error) {
          this.$message.error("创业板数据：" + ckResp.error);
          this.ckData = [];
        } else {
          const ckList = this.normalizeApiList(ckResp);
          this.ckData = Array.isArray(ckList) ? ckList : [];
        }
        this.debugLog && this.debugLog('CK', ckResp, this.ckData);
        this.displayTime = this.computeDisplayTime();
        if (!this.zbData.length && !this.ckData.length) {
          this.$message.warning("没有符合条件的行情数据！");
        } else {
          this.$message.success("行情数据加载成功！");
        }
      } catch (error) {
        this.$message.error("请求数据失败：" + error.message);
        this.zbData = [];
        this.ckData = [];
      }
    }, // end fetchStockData
    debugLog(label, resp, list) {
      try {
        // eslint-disable-next-line no-console
        console.log(`[${label}] raw:`, resp);
        const keys = Array.isArray(list) && list.length ? Object.keys(list[0]) : [];
        // eslint-disable-next-line no-console
        console.log(`[${label}] parsed length:`, Array.isArray(list) ? list.length : 'N/A', ' first keys:', keys);
      } catch(e) {
        // eslint-disable-next-line no-console
        console.warn(`[${label}] debugLog error:`, e);
      }
    },
    resetSearch() {
      this.searchParams = {
        changpercent: null,
        tradingamount_dw: null,
        cjbl: null,
        bscp: null,
        countnum: null,
        is_new: '',
        is_important: '',
      };
      this.lxzttsList = [];
      this.fetchStockData();
    },
    handleConfirmFilter() {
      this.showFilterPanel = false;
      this.fetchStockData();
    },
    selectAllBkgn() {
      this.selectedBkgn = this.bkgnOptions.map(item => item.bk_code);
    },
    reverseSelectBkgn() {
      this.selectedBkgn = this.bkgnOptions
        .filter(item => !this.selectedBkgn.includes(item.bk_code))
        .map(item => item.bk_code);
    },
    clearSelectBkgn() {
      this.selectedBkgn = [];
    },
    selectAllBkhy() {
      this.selectedBkhy = this.bkhyOptions.map(item => item.bk_code);
    },
    reverseSelectBkhy() {
      this.selectedBkhy = this.bkhyOptions
        .filter(item => !this.selectedBkhy.includes(item.bk_code))
        .map(item => item.bk_code);
    },
    clearSelectBkhy() {
      this.selectedBkhy = [];
    },
    // 不再需要 handleTabClick
    startAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      this.refreshTimer = setInterval(() => {
        this.fetchStockData();
      }, this.refreshInterval * 1000);
      this.autoRefreshing = true;
    },
    onStartAutoRefresh() {
      this.startAutoRefresh();
    },
    onStopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
      this.autoRefreshing = false;
    },
    handleRefreshIntervalChange() {
      this.startAutoRefresh();
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 320;
    },
    planTipPairs(tip) {
      // 将后端返回的 jj_tip 对象转成可读的键值对数组，带上中文标签
      if (!tip) return [];
      const pairs = [];
      const map = {
        title: '标题',
        rd_datetime: '公告时间',
        start_date: '开始',
        end_date: '结束',
        reduction_ratio: '比例',
        reduction_shares: '股数',
        reduction_amount_million: '金额(百万元)',
        reduction_price: '价格',
        holder_name: '主体',
        holder_identity: '身份',
        reduction_reason: '原因',
      };
      Object.keys(map).forEach(k => {
        const v = tip[k];
        if (v !== undefined && v !== null && String(v) !== '') {
          pairs.push({ label: map[k], value: v });
        }
      });
      return pairs;
    },
    formatYjggCell(yj) {
      if (yj == null) return '-';

      // 1) 若是纯字符串，直接展示；如果是 JSON 字符串则解析后走结构化格式
      if (typeof yj === 'string') {
        const s = yj.trim();
        if (!s) return '-';
        if ((s.startsWith('{') || s.startsWith('['))) {
          try { yj = JSON.parse(s); } catch(e) { return s; }
        } else {
          return s;
        }
      }

      // 2) 结构化对象：按字段拼装
      if (typeof yj === 'object') {
        const t = yj.timekey ? this.formatDateTime(yj.timekey) : '';
        const rp = yj.report_period || '';
        const pf = (yj.profit === 0 || yj.profit) ? yj.profit : '';
        const yoy = (yj.yoy_growth === 0 || yj.yoy_growth) ? (Number(yj.yoy_growth).toFixed(2) + '%') : '';
        const segs = [];
        if (t) segs.push(`时间:${t}`);
        if (rp) segs.push(`报告期:${rp}`);
        if (pf !== '') segs.push(`净利润:${pf}`);
        if (yoy !== '') segs.push(`同比:${yoy}`);
        return segs.join(' | ') || '-';
      }

      // 3) 其他类型兜底
      return String(yj);
    },
    formatDateTime(v) {
      try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        const pad = n => (n < 10 ? '0' + n : '' + n);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch(e) {
        return String(v);
      }
    },
    onDividerMouseDown(e) {
      this.dragging = true;
      this.dragStartY = e.clientY;
      this.dragStartRatio = this.topPane;
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp, { once: true });
    },
    onMouseMove(e) {
      if (!this.dragging) return;
      const container = this.$el.querySelector('.split-vertical');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dy = e.clientY - this.dragStartY;
      const deltaPercent = (dy / rect.height) * 100;
      let next = this.dragStartRatio + deltaPercent;
      // 边界与最小高度防守
      next = Math.max(10, Math.min(90, next));
      this.topPane = Math.round(next);
    },
    onMouseUp() {
      this.dragging = false;
      window.localStorage.setItem('stockshow_topPane', String(this.topPane));
      window.removeEventListener('mousemove', this.onMouseMove);
    },
    highlightHyName(text) {
      if (text == null) return '-';
      const parts = String(text)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (!parts.length) return '-';
      // 选中且为重点(zycd===2)的行业名称集合
      const selectedSet = new Set(this.selectedBkhy || []);
      const importantNames = new Set(
        (this.bkhyOptions || [])
          .filter(o => o && o.zycd === 2 && selectedSet.has(o.bk_code))
          .map(o => o.bk_name)
      );
      const esc = (s) => s.replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;');
      return parts
        .map(n => importantNames.has(n) ? `<span style="color:red">${esc(n)}</span>` : esc(n))
        .join(',');
    },
  },
  async created() {
    await this.getFieldInfo();
    await this.fetchBkgnOptions();
    await this.fetchBkhyOptions();
    this.fetchStockData();
    this.startAutoRefresh();
    const savedPane = Number(window.localStorage.getItem('stockshow_topPane'));
    if (!isNaN(savedPane) && savedPane >= 10 && savedPane <= 90) {
      this.topPane = savedPane;
    }
    // this.updateTableHeight();
    // window.addEventListener("resize", this.updateTableHeight);
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    // window.removeEventListener("resize", this.updateTableHeight);
  }
};

</script>

<style scoped>
.stock-shownew{ height:100vh; display:flex; flex-direction:column; overflow:hidden; background:#f9f9f9; padding:8px; }
.filter-card{ background:#fff; border-radius:4px; box-shadow:0 1px 3px rgb(0 0 0 / 0.06); margin-bottom:8px; flex:0 0 auto; }
.panel-header{ display:flex; justify-content:space-between; align-items:center; padding:6px 8px; border-bottom:1px solid #f0f0f0; font-size:12px; }
.filter-panel{ padding:6px; }
.filter-row{ margin-bottom:4px; }
.filter-label{ margin-right:2px; font-size:12px; }
.right-align{ display:flex; justify-content:flex-end; align-items:center; }
.split-vertical{ flex:1 1 auto; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.pane{ min-height:0; overflow:hidden; display:flex; flex-direction:column; flex:0 1 auto; }
.pane-inner{ background:#fff; border-radius:4px; box-shadow:0 1px 3px rgb(0 0 0 / 0.06); height:100%; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.pane-title{ font-weight:bold; padding:6px 8px; border-bottom:1px solid #f0f0f0; flex:0 0 auto; }
.pane-inner .el-table{ flex:1 1 auto; }
.divider{ height:6px; background:#e5e5e5; cursor:row-resize; margin:4px 0; border-radius:3px; }
::v-deep .el-table, /deep/ .el-table, >>> .el-table{ font-size:13px; }
::v-deep .el-table--mini td, /deep/ .el-table--mini td, >>> .el-table--mini td,
::v-deep .el-table--mini th, /deep/ .el-table--mini th, >>> .el-table--mini th{ padding:0 4px !important; height:22px !important; }
::v-deep .el-table--mini .cell, /deep/ .el-table--mini .cell, >>> .el-table--mini .cell{ padding:0 4px !important; line-height:18px !important; }
::v-deep .el-table__body tr, /deep/ .el-table__body tr, >>> .el-table__body tr{ height:22px !important; }
::v-deep .el-table__header .cell, /deep/ .el-table__header .cell, >>> .el-table__header .cell{ line-height:18px !important; }
::v-deep .el-table__body-wrapper{ height:100% !important; overflow:auto !important; }
.debug-box{ padding:4px 8px; font-size:12px; color:#666; border-bottom:1px dashed #eee; }
/* 条件高亮（红色） */
::v-deep .cell-red { color: #e53935 !important; font-weight: 600; }
::v-deep .row-red > td { color: #e53935 !important; }
</style>