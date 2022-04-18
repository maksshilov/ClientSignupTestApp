import React from 'react'
import { View, StyleSheet } from 'react-native'
import { windowWidth } from '../styles/variables'

export default function Divider({ major }) {
  return <View style={styles(major).divider}></View>
}

const styles = major =>
  StyleSheet.create({
    divider: {
      width: windowWidth,
      height: major ? 5 : 1,
      backgroundColor: '#aaa',
    },
  })
