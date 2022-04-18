import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
// src
import { windowWidth } from '../styles/variables'
//BODY

export default function Error({ text, date }) {
  return (
    <View style={styles(date).errorWrapper}>
      <Text style={styles().textError}>{text}</Text>
    </View>
  )
}

const styles = date =>
  StyleSheet.create({
    errorWrapper: {
      width: windowWidth * 0.9,
      paddingLeft: 5,
      paddingBottom: date ? 15 : 0,
    },
    textError: {
      color: 'red',
      textAlign: 'left',
    },
  })
