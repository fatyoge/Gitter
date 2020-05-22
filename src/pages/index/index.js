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
import { get_today } from '../../utils/dateutil'

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
      job_col1:[

      ]
    }
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
    const {study_item, study_record, classes, finish_classes, ready_classes} = this.state
    let study_itemid_tmp = ''
    let study_record_tmp = {}
    let classes_tmp = {}
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
          for (let cls in classes_tmp) {
            if (cls.name in study_record_tmp) {
              finish_classes.unshift(classes_tmp[cls])
            } else {
              ready_classes.unshift(classes_tmp[cls])
            }
          }
          let ready_switch_tmp = [...Array(ready_classes.length).keys()].map(i => false)
          let finish_switch_tmp = [...Array(finish_classes.length).keys()].map(i => true)
        
          that.setState({
            classes: classes_tmp,
            study_itemid: study_itemid_tmp,
            study_record: study_record_tmp,
            finish_classes: finish_classes,
            ready_classes: ready_classes,
            ready_switch:ready_switch_tmp,
            finish_switch:finish_switch_tmp,
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
        this.loadClasses()
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
    this.loadClasses()
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
        favoriteLanguages.unshift({
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
    //console.log("item")
    //console.log(e)
    if(e['target']['value']) {
      const { ready_switch } = this.state
      ready_switch[index] = true
      this.setState({
        popup: true,
        popuptitle: 'test',
        ready_switch_index: index,
        ready_switch: ready_switch,
      })
    }
  }


  onReadyLayoutClose(value){
    const { ready_switch, ready_switch_index } = this.state
    console.log(ready_switch[ready_switch_index])
    console.log(ready_switch_index)
    console.log(ready_switch)
    if (ready_switch[ready_switch_index]) {
      ready_switch[ready_switch_index] = false
      this.setState({
        ready_switch: ready_switch,
        popup: false
      })
    }
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
    //  classlist.unshift(classes[cls])
    //}
    
    //console.log('ready_classes:')
    //console.log(ready_classes)
    let finish_list = finish_classes.map((item, index) => {
      return (
        <AtListItem
          key={index}
          title={item.name}
          isSwitch
          //checked={this.state.finish_switch[index]}
          onSwitchChange={this.handleChange.bind(this, item, index)}
        />
      )
    })

    let ready_list = ready_classes.map((item, index) => {
      return (
        <AtListItem
          key={index}
          title={item.name}
          isSwitch
          switchIsCheck={this.state.ready_switch[index]}
          onSwitchChange={this.handleChange.bind(this, item, index)}
        />
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
                <AtForm>
                  <AtList>
                    {ready_list}
                  </AtList>
                </AtForm>
            </AtAccordion>
            <AtAccordion
              open={true}
              title='已完成'>
                <AtForm>
                  <AtList>
                    {finish_list}
                  </AtList>
                </AtForm>
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
          popup &&
          <View>
            <Picker mode='multiSelector'
              range={this.state.range}
              rangeKey={'name'}
              onChange={this.onChange}
              onCancel={this.onReadyLayoutClose}
            >
              <View className='filter' animation={this.state.animation}>
                <Text className='category'>{this.state.category.name}</Text>
                &
                <Text className='language'>{this.state.language.name}</Text>
              </View>
            </Picker>
          </View>
        }
      </View>
    )
  }
}

export default Index
