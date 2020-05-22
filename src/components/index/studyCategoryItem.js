import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'


import './studyCategoryItem.less'

export default class StudyCategoryItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    categoryType: PropTypes.number
  }

  static defaultProps = {
    item: null,
    categoryType: 0
  }

  render() {
    const { item, categoryType } = this.props
    if (!item) return <View />

    //let currentPeriod = null
    //if (categoryType === 0) {
    //  currentPeriod = item.currentPeriodStars + ' stars today'
    //}else if (categoryType === 1) {
    //  currentPeriod = item.currentPeriodStars + ' stars this week'
    //}else if (categoryType === 2) {
    //  currentPeriod = item.currentPeriodStars + ' stars this month'
    //}

    return (
     <View className='content'>
       <View className='title_view'>
         <AtIcon prefixClass='ion' value='md-bookmarks' size='25' color='#333' />
         <View className='repo_title'>{item.category_name}</View>
       </View>
       {/* <View className='repo_desc'>{item.description}</View> */}
       <View className='number_info'>
         {/* {
           <View className='number_item'>
             <AtIcon prefixClass='ion' value='ios-radio-button-on' size='15' color={item.languageColor} />
             <Text className='number_title'>{item.category_name}</Text>
           </View>
         } */}
         <View className='number_item'>
           <AtIcon prefixClass='ion' value='ios-star' size='15' color='#7f7f7f' />
           <Text className='number_title'>上周完成: 10</Text>
         </View>
         <View className='number_item'>
           <AtIcon prefixClass='ion' value='ios-git-network' size='15' color='#7f7f7f' />
           <Text className='number_title'>本周完成: 20</Text>
         </View>
         
       
       </View>
     </View>
    )
  }

}
