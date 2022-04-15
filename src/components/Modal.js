import React, { useEffect, useState } from 'react'
import { View, Text, Modal, StyleSheet } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// BODY

export default function ModalPopup({ ok }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    console.log('ok', ok)
    if (ok !== undefined) {
      setTimeout(() => {
        setVisible(true)
      }, 0)
      setTimeout(() => {
        setVisible(false)
      }, 3000)
    }
  }, [ok])

  return (
    <View style={styles.center}>
      <Modal animationType="fade" visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.center}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons
              name={ok ? 'check-bold' : 'close-circle'}
              size={30}
              color={ok ? '#13d568' : '#ef4610'}
            />
            <Text style={styles.text}>{ok ? 'Вы успешно\nзарегистрировались' : `Ошибка!\nПопробуйте позже.`}</Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    elevation: 5,
  },
  text: {
    paddingTop: 20,
    textAlign: 'center',
    fontSize: 20,
  },
})
