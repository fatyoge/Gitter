import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Text, Checkbox } from '@tarojs/components'
import { AtInputNumber,AtListItem,AtSwitch,AtSwipeAction } from 'taro-ui'

import './classesItem.less'

export default class ClassesItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    categoryType: PropTypes.number
  }

  static defaultProps = {
    item: {},
    categoryType: 3
  }

  onSwitch (value) {
  }

  render() {
    const { item, categoryType } = this.props
    if (!item) return <View />
    //finish_classes = item.filter(function (item) {
    //  return !item.completed
    //})
    //ready_classes = item.filter(function (item) {
    //  return item.completed
    //})

    //const finishes = item.map((item, index) => {
    //  return (
    //    <AtListItem title={item.name} arrow='right'>
    //    </AtListItem>
    //  )
    //})
    console.log(item)
    return (
      //<AtListItem title={item.name} arrow='right'>
      //</AtListItem>
      //<AtSwipeAction title={item.name} checked={this.state.value} onChange={this.onSwitch}>
        <AtSwitch title='开启中' checked={false} onChange={this.handleChange} />
    )
    //const readys = ready_classes.map((item, index) => {
    //  return (
    //      <View key={index} className='tag-item'>
    //        <AtTag circle active onClick={this.onTagClick.bind(this)} name={item.name}>{item.name}</AtTag>
    //      </View>
    //  )
    //})

    //<view class="container">
    //  <view class="header">
    //    <image class="plus" src="../../assets/plus.png"/>
    //    <input class="new-todo" value="{{ input }}" placeholder="Anything here..." auto-focus bindinput="inputChangeHandle" bindconfirm="addTodoHandle"/>
    //  </view>
    //  <block wx:if="{{ todos.length }}">
    //    <view class="todos">
    //      <!-- List items should get the class `completed` when marked as completed -->
    //      <view class="item{{ item.completed ? ' completed' : '' }}" wx:for="{{ todos }}" wx:key="{{ index }}" bindtap="toggleTodoHandle" data-index="{{ index }}">
    //        <!-- completed: success, todo: circle -->
    //        <icon class="checkbox" type="{{ item.completed ? 'success' : 'circle' }}"/>
    //        <text class="name">{{ item.name }}</text>
    //        <icon class="remove" type="clear" size="16" catchtap="removeTodoHandle" data-index="{{ index }}"/>
    //      </view>
    //    </view>
    //    <view class="footer">
    //      <text class="btn" bindtap="toggleAllHandle">Toggle all</text>
    //      <text wx:if="{{ leftCount }}">{{ leftCount }} {{ leftCount === 1 ? 'item' : 'items' }} left</text>
    //      <text class="btn" wx:if="{{ todos.length > leftCount }}" bindtap="clearCompletedHandle">Clear completed</text>
    //    </view>
    //  </block>
    //  <block wx:else>
    //    <view class="empty">
    //      <text class="title">Congratulations!</text>
    //      <text class="content">There's no more work left.</text>
    //    </view>
    //  </block>
    //</view>
  }

}
