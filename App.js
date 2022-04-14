import React, { useState, useReducer, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Checkbox, RadioButton, TextInput } from 'react-native-paper'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// src
import { windowWidth } from './src/styles/variables'
// BODY

const SET_FORM = 'SET_FORM'
const formReducer = (state, action) => {
  if (action.type === SET_FORM) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    }

    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    }

    let updatedFormIsValid = false
    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid,
    }
  }
  return state
}

export default function App() {
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      lastName: '',
      firstName: '',
      thirdName: '',
      birthDate: '',
      gender: undefined,
      status: null,
      sms: false,
    },
    inputValidities: {
      lastName: true,
      firstName: true,
      birthDate: true,
    },
    formIsValid: false,
  })

  const { firstName, lastName, thirdName, gender, sms } = formState.inputValues

  function inputChangeHandler(inputIdentifier, inputValue, inputValidity) {
    dispatchFormState({
      type: SET_FORM,
      input: inputIdentifier,
      value: inputValue,
      isValid: inputValidity,
    })
  }

  const [date, setDate] = useState(new Date())
  console.log(date)
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate.toISOString().split('T')
    setDate(currentDate)
  }
  const showMode = currentMode => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    })
  }
  const showDatepicker = () => {
    showMode('date')
  }
  const showTimepicker = () => {
    showMode('time')
  }

  console.log(formState)

  return (
    <View style={styles.center}>
      <View style={styles.wrapper}>
        <TextInput
          label={'Фамилия *'}
          mode="outlined"
          onChangeText={text => {
            text = text.toString().trim().replace(/\d/g, '')
            inputChangeHandler('lastName', text)
          }}
          value={() => lastName}
          returnKeyType="next"
          onEndEditing={() => console.log('end editing')}
          onSubmitEditing={() => console.log('submit editing')}
        />
      </View>
      <View style={styles.wrapper}>
        <TextInput
          label={formState.inputValidities.firstName ? 'Имя *' : 'Необходимо ввести имя'}
          error={!formState.inputValidities.firstName}
          mode="outlined"
          onChangeText={text => {
            let isValid = formState.inputValidities.firstName
            isValid = text.toString().trim().length > 0
            console.log(isValid)
            text = text.toString().trim().replace(/\d/g, '')
            inputChangeHandler('firstName', text, isValid)
          }}
          value={() => firstName}
          onEndEditing={() => console.log('end editing')}
          onSubmitEditing={() => console.log('submit editing')}
        />
      </View>
      <View style={styles.wrapper}>
        <TextInput
          label={'Отчество'}
          mode="outlined"
          onChangeText={text => {
            text = text.toString().trim().replace(/\d/g, '')
            inputChangeHandler('thirdName', text)
          }}
          value={() => thirdName}
        />
      </View>

      <View style={[styles.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
        <Text style={styles.genderTitle}>День рождения:</Text>
        <Text style={styles.genderText}> {date[0]} </Text>
        <TouchableOpacity onPress={showDatepicker}>
          <MaterialCommunityIcons name="calendar" color={'#000'} size={25} />
        </TouchableOpacity>
      </View>

      <View style={styles.gender}>
        <Text style={styles.genderTitle}>Пол:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton
            value={'m'}
            status={gender === 1 ? 'checked' : 'unchecked'}
            onPress={inputChangeHandler.bind(null, 'gender', 1)}
          />
          <Text style={styles.genderText}>Мужской</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton
            value={'f'}
            status={gender === 0 ? 'checked' : 'unchecked'}
            onPress={inputChangeHandler.bind(null, 'gender', 0)}
          />
          <Text style={styles.genderText}>Женский</Text>
        </View>
      </View>

      <View style={[styles.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
        <Checkbox status={sms ? 'checked' : 'unchecked'} onPress={() => inputChangeHandler('sms', !sms)} />
        <Text style={styles.genderText}>Уведомления по СМС</Text>
      </View>
      <Button mode="contained" onPress={() => console.log('send')}>
        Sign Up
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  wrapper: {
    width: windowWidth * 0.9,
    marginVertical: 10,
  },

  genderTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  genderText: {
    fontSize: 15,
  },
  gender: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    width: windowWidth * 0.9,
    marginVertical: 10,
  },
})
