import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { get as getGlobalData, set as setGlobalData  } from '../../utils/global_data'
import { AtTag, AtIndexes } from 'taro-ui'
import { quickClassesIndex } from '../../assets/classes/quickClasses'
import { quickClasses } from '../../utils/quickClasses'
import { GLOBAL_CONFIG } from '../../constants/globalConfig'

import './quickClasses.less'

class QuickClasses extends Component {

  config = {
    navigationBarTitleText: '快速添加项目'
  }

  constructor(props) {
    super(props)
    this.state = {
      itemId: null,
      classes: [],
      classesTag: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.loadClasses()
  }

  // loadClassesTag() {
  //   let that = this
  //   let classes = getGlobalData('classes')
  //   let itemId = getGlobalData('classesItemid')
  //   const { classesTag } = this.state
  //   //const { classesTag, classes } = this.state
  //   console.log("classes:")
  //   console.log(classes)
  //   for (let cls of Object.keys(classes)) {
  //     console.log("cls:"+cls)
  //     console.log("cls in :"+cls in quickClasses)
  //     if (cls in quickClasses) {
  //       classesTag.unshift(classes[cls])
  //     }
  //   }
  //   console.log("classesTag")
  //   console.log(classesTag)
  //   that.setState({
  //     itemId: itemId,
  //     classes: classes,
  //     classesTag: classesTag
  //   })
  //   setGlobalData('classesTag', classesTag)
  // }

  componentWillUnmount() {
  }

  componentDidShow() {
    
  }

  componentDidHide() {
  }

  loadClasses() {
    let that = this
    Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
    const { classesTag } = this.state
    const db = wx.cloud.database()
    let openid = getGlobalData('openid')
    console.log("openid:"+openid)
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }
    db.collection('classes')
      .where({
        _openid: openid, // 当前用户 openid
      })
      .get()
      .then(res => {
        Taro.hideLoading()
        if (res.data.length > 0) {
          //for (let cls of Object.keys(res.data[0].classes)) {
          //  if (cls in quickClasses) {
          //    classesTag.unshift(res.data[0].classes[cls])
          //  }
          //}
          for (let cls of res.data[0].classes) {
            if (cls.name in quickClasses) {
              classesTag.unshift(cls)
            }
          }
          that.setState({
            itemId: res.data[0]._id,
            classes: res.data[0].classes,
            classesTag: classesTag
          })
        }
      })
      .catch(err => {
        Taro.hideLoading()
        console.error(err)
      })
  }

  saveClasses() {
    let that = this
    Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
    const { classes, itemId } = this.state
    const db = wx.cloud.database()
    console.log('classes: ' + this.state)
    if (itemId && itemId.length > 0) {
      // 更新
      db.collection('classes').doc(itemId).update({
        data: {
          classes: classes
        }
      })
        .then(res => {
          Taro.hideLoading()
          console.log(res)
          setGlobalData('classes', classes)
        })
        .catch(console.error)
    } else {
     // 新增
      db.collection('classes').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          classes: classes
        }
      })
        .then(res => {
          Taro.hideLoading()
          console.log(res)
          that.setState({
            itemId: res._id
          })
          setGlobalData('classes', classes)
        })
        .catch(console.error)
    }
  }

  onClick (item) {
    console.log("test:")
    console.log(item)
    let that = this
    const { classes, classesTag } = this.state
    let exits = false
    //for (let cls of Object.keys(classes)) {
    //if (cls === item.name) {
    for (let cls of classesTag) {
      if (cls.name === item.name) {
        exits = true
        break
      }
    }
    if (!exits) {
      classesTag.unshift(item)
      //classes[item.name] = item
      classes.unshift(item)
      console.log("onclick classesTag:")
      console.log(classesTag)
      this.setState({
        classes: classes,
        classesTag: classesTag
      }, ()=> {
        that.saveClasses()
        Taro.showToast({
          title: '添加成功',
          icon: 'success'
        })
      })
    } else {
      Taro.showToast({
        title: '已经存在',
        icon: 'success'
      })
    }
  }

  onTagClick (item) {
    let that = this
    const { classes, classesTag } = this.state
    for (let cls of classesTag) {
      if (cls.name === item.name) {
        //delete classes[cls.name]
        classes.splice(classes.indexOf(cls), 1)
        classesTag.splice(classesTag.indexOf(cls), 1)
        console.log('remove tag:' + cls.name)
        console.log(classes)
        console.log(classesTag)
        break
      }
    }
    this.setState({
      classes: classes,
      classesTag: classesTag
    }, ()=> {
      that.saveClasses()
      Taro.showToast({
        title: '已取消',
        icon: 'success'
      })
    })
  }

  render() {
    const { classesTag } = this.state
    const list = classesTag.map((item, index) => {
      return (
          <View key={index} className='tag-item'>
            <AtTag circle active onClick={this.onTagClick.bind(this)} name={item.name}>{item.name}</AtTag>
          </View>
      )
    })
    return (
      <View className='content'>
        <AtIndexes list={quickClassesIndex}
                   onClick={this.onClick.bind(this)} >
          {
            classesTag.length > 0 &&
            <View className='header-view'>
              <View className='header-title'>tips: Click to delete</View>
              <View className='tag-view'>
                {list}
              </View>
            </View>
          }
        </AtIndexes>
      </View>
    )
  }
}

export default QuickClasses
