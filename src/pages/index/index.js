import Taro, { Component } from '@tarojs/taro'
import { View, Picker, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { GLOBAL_CONFIG } from '../../constants/globalConfig'
import { languages } from '../../utils/language'
//import { classes } from '../../utils/quickClasses'
import { get as getGlobalData, set as setGlobalData } from '../../utils/global_data'
import { AtNoticebar,AtAccordion,AtListItem,AtForm,AtFloatLayout  } from 'taro-ui'

import ItemList from '../../components/index/itemList'
import Segment from '../../components/index/segment'
import Empty from '../../components/index/empty'

import './index.less'
import { get_today, json_splice, getJsonLength} from '../../utils/dateutil'
import { default_selector1, default_selector2, default_index1, default_index3, default_selector3} from '../../utils/selector'



class Index extends Component {

  config = {
    navigationBarTitleText: 'Study Diary',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      category: {
        'name': 'Today',
        'value': 'daily'
      },
      language: {
        'name': 'All',
        'urlParam': ''
      },
      popup:false,
      itemId: null,
      classes: [],
      classlist: [],
      ready_classes: [],
      finish_classes:[],
      study_record: {},
      study_itemid: null,
      quickClasses: {
      },
      animation: null,
      isHidden: false,
      fixed: false,
      notice: null,
      notice_closed: false,
      repos: [],
      developers: [],
      study_category: [],
      ready_switch: [],
      finish_switch: [],
      ready_switch_index: 0,
      range: [
        [{
          'name': 'Today',
          'value': 'daily'
        },
        {
          'name': 'Week',
          'value': 'weekly'
        },
        {
          'name': 'Month',
          'value': 'monthly'
        }],
        languages
      ],
      ready_classes_seletor:[

      ],
      ready_classes_selindex:[

      ],
      finish_classes_seletor:[

      ]
    }
  }

  loadClassList() {
    console.log('function: loadClass')
    let openid = getGlobalData('openid')
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }

    let that = this
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'classes',
      // 传递给云函数的event参数
      data: {
        type: 'study_record',
        openid: openid,
        date: get_today(),
      }
    }).then(res => {
      console.log(res)
      const {study_item, study_record, ready_classes_selindex, finish_classes, ready_classes, ready_classes_seletor, current} = this.state
      let study_itemid_tmp = res.result.study_itemid_tmp
      let study_record_tmp = res.result.study_record_tmp
      let classes_tmp = res.result.classes_tmp
      let finish_classes_tmp = []
      let ready_classes_tmp = []
      let ready_classes_seletor_tmp = []
      let ready_classes_selindex_tmp = []
      for (let cls in classes_tmp) {
        cls = classes_tmp[cls]
        if (cls.name in study_record_tmp) {
          finish_classes_tmp.push(cls)
        } else {
          ready_classes_tmp.push(cls)
          let col1 = default_selector1
          let col2 = JSON.parse(JSON.stringify(default_selector2[cls.default_unit]))
          if ('default_unit' in cls && cls.unit_name ==='int') {
            col2.map(function(i){i['name'] = i['name'] + cls.unit_name}) 
          }
          //console.log("cls.default_unit")
          //console.log(cls)
          //console.log(col2)
          let col1_index = default_index1[cls.default_unit]
          let selector = [col1, col2]
          let selindex = [col1_index, 0]
          if (cls.default_unit === 'int') {
            let col3_index = default_index3[cls.default_time]
            selector.push(default_selector3)
            selindex.push(col3_index)
          }
          ready_classes_seletor_tmp.push(selector)
          ready_classes_selindex_tmp.push(selindex)
          //console.log("ready_classes_seletor")
          //console.log(ready_classes_seletor_tmp)
          //console.log(ready_classes_selindex_tmp)
        }
      }
      this.setState({
        classes: classes_tmp,
        study_itemid: study_itemid_tmp,
        study_record: study_record_tmp,
        finish_classes: finish_classes_tmp,
        ready_classes: ready_classes_tmp,
        // ready_switch:ready_switch_tmp,
        // finish_switch:finish_switch_tmp,
        ready_classes_seletor:ready_classes_seletor_tmp,
        ready_classes_selindex:ready_classes_selindex_tmp,
      }, () => {
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 0) {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })
  }

  loadClasses() {
    let that = this
    Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
    const db = wx.cloud.database()
    let openid = getGlobalData('openid')
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }
    console.log("openid:"+openid)
    const {study_item, study_record, ready_classes_selindex, finish_classes, ready_classes, ready_classes_seletor} = this.state
    let study_itemid_tmp = ''
    let study_record_tmp = {}
    let classes_tmp = {}
    let finish_classes_tmp = []
    let ready_classes_tmp = []
    let ready_classes_seletor_tmp = []
    let ready_classes_selindex_tmp = []
    db.collection('study_record')
      .where({
        _openid: openid, // 当前用户 openid
        date: get_today()
      })
      .get()
      .then(res => {
        Taro.hideLoading()
        if (res.data.length > 0) {
          //that.setState({
          //  study_item: res.data[0]._id,
          //  study_record: res.data[0].study_record,
          //})
          study_itemid_tmp = res.data[0]._id
          study_record_tmp = res.data[0].study_record
        }
      })
      .catch(err => {
        Taro.hideLoading()
        console.error(err)
      })
    console.log("study_record_tmp:"+study_itemid_tmp)
    console.log(study_record_tmp)
    db.collection('classes')
      .where({
        _openid: openid, // 当前用户 openid
      })
      .get()
      .then(res => {
        Taro.hideLoading()
        if (res.data.length > 0) {
          //that.setState({
          //  //itemId: res.data[0]._id,
          //  classes: res.data[0].classes,
          //})
          
          classes_tmp = res.data[0].classes
          console.log("study_record_tmp:"+study_itemid_tmp)
          console.log(study_record_tmp)
          for (let cls in classes_tmp) {
            cls = classes_tmp[cls]
            if (cls.name in study_record_tmp) {
              finish_classes_tmp.push(cls)
            } else {
              ready_classes_tmp.push(cls)
              let col1 = default_selector1
              let col2 = JSON.parse(JSON.stringify(default_selector2[cls.default_unit]))
              if ('default_unit' in cls && cls.unit_name ==='int') {
                col2.map(function(i){i['name'] = i['name'] + cls.unit_name}) 
              }
              //console.log("cls.default_unit")
              //console.log(cls)
              //console.log(col2)
              let col1_index = default_index1[cls.default_unit]
              let selector = [col1, col2]
              let selindex = [col1_index, 0]
              if (cls.default_unit === 'int') {
                let col3_index = default_index3[cls.default_time]
                selector.push(default_selector3)
                selindex.push(col3_index)
              }
              ready_classes_seletor_tmp.push(selector)
              ready_classes_selindex_tmp.push(selindex)
              //console.log("ready_classes_seletor")
              //console.log(ready_classes_seletor_tmp)
              //console.log(ready_classes_selindex_tmp)
            }
          }
          // let ready_switch_tmp = [...Array(ready_classes_tmp.length).keys()].map(i => false)
          // let finish_switch_tmp = [...Array(finish_classes_tmp.length).keys()].map(i => true)
        
          that.setState({
            classes: classes_tmp,
            study_itemid: study_itemid_tmp,
            study_record: study_record_tmp,
            finish_classes: finish_classes_tmp,
            ready_classes: ready_classes_tmp,
            // ready_switch:ready_switch_tmp,
            // finish_switch:finish_switch_tmp,
            ready_classes_seletor:ready_classes_seletor_tmp,
            ready_classes_selindex:ready_classes_selindex_tmp,
          })
        }
      })
      .catch(err => {
        Taro.hideLoading()
        console.error(err)
      })
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount() {
  }

  tobegin = () => {
    Taro.redirectTo({
      url: '/pages/index/index'
    })
  };

  componentDidMount() {
    this.interstitialAd = null
    try {
      console.log('function: componentDidMount')
      const value = Taro.getStorageSync('userInfo')
      if (value) {
        Taro.showLoading({ title: GLOBAL_CONFIG.LOADING_TEXT })
        //this.loadLanguages()
        //this.loadClasses()
        this.loadItemList()
        this.loadCategoryList()
        this.loadNotice()
        //this.loadinterstitialAd()

        let that = this
        Taro.getSystemInfo({
          success(res) {
            that.setState({
              windowHeight: res.windowHeight - (res.windowWidth / 750) * 80
            })
          }
        })
      } else {
        console.log('no user')
      }
    } catch (e) {
      // Do something when catch error
    } 
  }

  componentWillUnmount() { }

  componentDidShow() {
    //this.updateLanguages()
    // 在适合的场景显示插屏广告
    if (this.interstitialAd) {
      this.interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  }

  componentDidHide() { }

  onPullDownRefresh() {
    this.loadItemList()
    this.loadCategoryList()
    //this.loadClasses()
    this.loadClassList()
  }

  onPageScroll(obj) {
    const { fixed } = this.state
    if (obj.scrollTop > 0) {
      if (!fixed) {
        this.setState({
          fixed: true
        })
      }
    } else {
      this.setState({
        fixed: false
      })
    }
  }

  onScroll(e) {
    if (e.detail.scrollTop < 0) return;
    if (e.detail.deltaY > 0) {
      let animation = Taro.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      }).bottom(25).step().export()
      this.setState({
        isHidden: false,
        animation: animation
      })
    } else {
      //向下滚动
      if (!this.state.isHidden) {
        let animation = Taro.createAnimation({
          duration: 400,
          timingFunction: 'ease',
        }).bottom(-95).step().export()
        this.setState({
          isHidden: true,
          animation: animation
        })
      }
    }
  }

  //onChange = e => {
  //  this.setState({
  //    category: this.state.range[0][e.detail.value[0]],
  //    language: this.state.range[1][e.detail.value[1]]
  //  }, () => {
  //    Taro.showLoading({ title: GLOBAL_CONFIG.LOADING_TEXT })
  //    this.loadItemList()
  //    this.loadCategoryList()
  //  })
  //}

  loadCategoryList() {
    console.log('function: loadCategoryList')
    const { current } = this.state
    let that = this
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'category',
      // 传递给云函数的event参数
      data: {
        type: 'study_category',
        _openid: this.openid,
        where: ''
      }
    }).then(res => {
      that.setState({
        study_category: res.result.data
      }, () => {
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 0) {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })
  }

  loadItemList() {
    const { current } = this.state
    let that = this
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'trend',
      // 传递给云函数的event参数
      data: {
        type: 'repositories',
        language: that.state.language.urlParam,
        since: that.state.category.value
      }
    }).then(res => {
      that.setState({
        repos: res.result.data
      }, () => {
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 0) {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })

    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'trend',
      // 传递给云函数的event参数
      data: {
        type: 'developers',
        language: that.state.language.urlParam,
        since: that.state.category.value
      }
    }).then(res => {
      that.setState({
        developers: res.result.data
      }, () => {
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 1) {
          Taro.stopPullDownRefresh()
          Taro.hideLoading()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })
  }

  loadStudyItem() {
    let that = this
    const db = wx.cloud.database()
    let openid = getGlobalData('openid')
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }
    db.collection('study_item')
      .where({
        _openid: openid, // 当前用户 openid
      })
      .get()
      .then(res => {
        console.log(res)
        if (res.data.length > 0) {
          setGlobalData('studyitem', res.data[0])
          that.setState({
            studyitem: res.data[0]
          })
          //that.updateLanguages()
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  loadLanguages() {
    let that = this
    const db = wx.cloud.database()
    let openid = getGlobalData('openid')
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }
    db.collection('languages')
      .where({
        _openid: openid, // 当前用户 openid
      })
      .get()
      .then(res => {
        console.log(res)
        if (res.data.length > 0) {
          setGlobalData('favoriteLanguages', res.data[0].languages)
          that.updateLanguages()
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  loadNotice() {
    let that = this
    const db = wx.cloud.database()
    db.collection('notices')
      .get()
      .then(res => {
        console.log('notices', res)
        if (res.data.length > 0) {
          const key = 'notice_key_' + res.data[0].notice_id
          const notice_closed = Taro.getStorageSync(key)
          that.setState({
            notice: res.data[0],
            notice_closed: notice_closed
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  loadinterstitialAd() {
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-fe997b16f427f91f'
      })
      this.interstitialAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      this.interstitialAd.onError((err) => {
        console.log('onError event emit', err)
      })
      this.interstitialAd.onClose((res) => {
        this.interstitialAd = null
        console.log('onClose event emit', res)
      })
    }
  }

  updateLanguages() {
    let favoriteLanguages = getGlobalData('favoriteLanguages')
    if (favoriteLanguages && favoriteLanguages.length > 0) {
      let language = favoriteLanguages[0]
      if (language.name !== 'All') {
        favoriteLanguages.push({
          "urlParam": "",
          "name": "All"
        })
      }
      this.setState({
        range: [
          [{
            'name': 'Today',
            'value': 'daily'
          },
          {
            'name': 'Week',
            'value': 'weekly'
          },
          {
            'name': 'Month',
            'value': 'monthly'
          }],
          favoriteLanguages
        ]
      })
    } else {
      this.setState({
        range: [
          [{
            'name': 'Today',
            'value': 'daily'
          },
          {
            'name': 'Week',
            'value': 'weekly'
          },
          {
            'name': 'Month',
            'value': 'monthly'
          }],
          languages
        ]
      })
    }
  }

  onTabChange(index) {
    this.setState({
      current: index
    })
  }

  onShareAppMessage(obj) {
    return {
      title: 'Github 今日热榜，随时随地发现您喜欢的开源项目',
      path: '/pages/index/index',
      imageUrl: 'http://img.huangjianke.com/cover.png'
    }
  }

  onCloseNotice() {
    const { notice } = this.state
    const key = 'notice_key_' + notice.notice_id
    Taro.setStorageSync(key, true)
  }
  onclickAccordion(){
  }
  handleChange(item, index, e){
    // console.log("handleChange")
    // console.log(item)
    // console.log(item.name)
    // console.log(index)
    // console.log(e)

    if(!e['target']['value']) {
      const { finish_classes, study_record, ready_classes} = this.state
      let study_record_tmp = JSON.parse(JSON.stringify(study_record))
      console.log(item.name in study_record_tmp)
      console.log(study_record_tmp)
      if (item.name in study_record_tmp){
        console.log('delete study record:'+item.name)
        // study_record_tmp = json_splice(study_record_tmp, item.name)
        delete study_record_tmp[item.name]
        console.log(study_record_tmp)
      }
      //study_record.splice(study_record.indexOf(item.name), 1)
      finish_classes.splice(finish_classes.indexOf(item), 1)
      ready_classes.push(item)
      this.setState({
        study_record: study_record_tmp,
        ready_classes: ready_classes,
        finish_classes: finish_classes,
      }, ()=> {
        this.saveFinishStudy()
        //console.log(study_record)
      })
    }
  }


  //onReadyLayoutClose(value){
  //  const { ready_switch, ready_switch_index } = this.state
  //  console.log(ready_switch[ready_switch_index])
  //  console.log(ready_switch_index)
  //  console.log(ready_switch)
  //  if (ready_switch[ready_switch_index]) {
  //    ready_switch[ready_switch_index] = false
  //    this.setState({
  //      ready_switch: ready_switch,
  //      popup: false
  //    })
  //  }
  //}

  saveFinishStudy() {
    let that = this
    Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
    const { study_record, study_itemid } = this.state
    const db = wx.cloud.database()
    console.log('save study_record')
    console.log(study_record)
    console.log(study_itemid)
    if (study_itemid && study_itemid.length > 0) {
      // 更新
      //if (study_record.length > 0) {
      if (getJsonLength(study_record) > 0) {
        db.collection('study_record').doc(study_itemid).update({
          data: {
            study_record: study_record
          }
        })
          .then(res => {
            console.log(res)
            Taro.pageScrollTo({
              scrollTop: 0
            })
            Taro.hideLoading()
            Taro.stopPullDownRefresh()
          })
          .catch(console.error)
      } else {
        db.collection('study_record').doc(study_itemid).remove()
          .then(res => {
            Taro.hideLoading()
          })
          .catch(console.error)
      }
    }else {
     // 新增
      db.collection('study_record').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          date: get_today(),
          study_record: study_record
        }
      })
        .then(res => {
          Taro.hideLoading()
          console.log(res)
          that.setState({
            study_itemid: res._id
          })
        })
        .catch(console.error)
    }
  }

  onReadyPickerComfirm(item,index,e){
    // console.log("onReadyPickerComfirm："+index)
    // console.log(item)
    // console.log(e)
    const {finish_classes, study_record, ready_classes, ready_classes_seletor} = this.state
    // console.log(ready_classes_seletor[index])
    // console.log(e.detail.value[0])
    study_record[item.name] = {
      "name": item.name,
      "unit_name": ready_classes_seletor[index][0][e.detail.value[0]]['value'],
      "total_cnt": e.detail.value.length > 2 ? ready_classes_seletor[index][1][e.detail.value[1]]['value'] : 1,
      "total_time": e.detail.value.length > 2 ? ready_classes_seletor[index][2][e.detail.value[2]]['value'] : ready_classes_seletor[1][e.detail.value[1]]
    }
    console.log(study_record)
    finish_classes.push(item)
    ready_classes.splice(ready_classes.indexOf(item), 1)
    ready_classes_seletor.splice(index, 1)
    this.setState({
      study_record:study_record,
      finish_classes:finish_classes,
      ready_classes:ready_classes,
      ready_classes_seletor:ready_classes_seletor,
    }, ()=> {
      this.saveFinishStudy()
    })
  }

  onReadyPickerChange(item,index,e){
    console.log("onReadyPickerChange："+index)
    console.log(item)
    console.log(e)
  }

  onSelection(value) {
    console.log("value")
    console.log(value)
  }

  render() {
    let categoryType = 0
    let categoryValue = this.state.category.value
    if (categoryValue === 'weekly') {
      categoryType = 1
    } else if (categoryValue === 'monthly') {
      categoryType = 2
    }
    const { classes, classlist, finish_classes,ready_classes,current, notice, fixed, notice_closed, study_category, popup} = this.state
    //console.log('study_category:')
    //console.log(study_category)
    //console.log('classes:')
    //console.log(classes)
    //for (let cls in classes) {
    //  //console.log("cls:" + cls)
    //  classlist.push(classes[cls])
    //}
    
    console.log('ready_classes:')
    console.log(ready_classes)
    let finish_list = finish_classes.map((item, index) => {
      return (
        <AtListItem
          key={index}
          title={item.name}
          isSwitch={true}
          switchIsCheck={true}
          onSwitchChange={this.handleChange.bind(this, item, index)}
        />
      )
    })

    let ready_list = ready_classes.map((item, index) => {
      return (
        <Picker mode='multiSelector'
          key={index}
          range={this.state.ready_classes_seletor[index]}
          rangeKey={'name'}
          value={this.state.ready_classes_selindex[index]}
          onChange={this.onReadyPickerComfirm.bind(this, item, index)}
          onColumnChange={this.onReadyPickerChange.bind(this, item, index)}
          // onCancel={this.onReadyLayoutClose}
        >
          <AtList>
            <AtListItem key={index} title={item.name} />
          </AtList>
        </Picker>
      )
    })

    return (
      <View className='content'>
        <View className={fixed ? 'segment-fixed' : ''}>
          <Segment tabList={['REPO', '项目计划']}
            current={current}
            onTabChange={this.onTabChange}
          />
        </View>
        {/* <AtFloatLayout isOpened={popup} title={this.state.popuptitle} onClose={this.onReadyLayoutClose.bind(this)}> 
          <View>
            <Text className='category'>{this.state.category.name}</Text>
          </View>
        </AtFloatLayout> */}
        {
          fixed &&
          <View className='segment-placeholder' />
        }
        {
          (notice.status && !notice_closed) &&
          <AtNoticebar icon='volume-plus'
            close
            onClose={this.onCloseNotice.bind(this)}>
            {notice.content}
          </AtNoticebar>
        }
        {
          current === 0 &&
          (ready_classes.length + finish_classes.length > 0 ? 
            <View className='segment-placeholder'>
            <AtAccordion
              open={true}
              title='待完成'>
                    {ready_list}
            </AtAccordion>
            <AtAccordion
              open={true}
              title='已完成'>
                    {finish_list}
            </AtAccordion>
            </View>
            : <Empty />)
        }
        {
          current === 1 &&
          //(developers.length > 0 ? <ItemList itemList={developers} type={1} categoryType={categoryType} /> : <Empty />)
          (<ItemList itemList={finish_classes} type={3} categoryType={categoryType} />)
        }
        {
          // popup &&
          // <View>
          //   <Picker mode='multiSelector'
          //     range={this.state.range}
          //     rangeKey={'name'}
          //     onChange={this.onChange}
          //     onCancel={this.onReadyLayoutClose}
          //   >
          //     <View className='filter' animation={this.state.animation}>
          //       <Text className='category'>{this.state.category.name}</Text>
          //       &
          //       <Text className='language'>{this.state.language.name}</Text>
          //     </View>
          //   </Picker>
          // </View>
        }
      </View>
    )
  }
}

export default Index
