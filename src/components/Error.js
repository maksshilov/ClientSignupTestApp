import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
// src
import { windowWidth } from '../styles/variables'
//BODY

export default function Error({ text }) {
  return (
    <View style={styles.errorWrapper}>
      <Text style={styles.textError}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  errorWrapper: {
    width: windowWidth * 0.9,
    paddingLeft: 5,
  },
  textError: {
    color: 'red',
    textAlign: 'left',
  },
})
