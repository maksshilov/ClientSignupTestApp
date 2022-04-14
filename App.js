import React, { useReducer } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Button, Checkbox, RadioButton, TextInput } from 'react-native-paper'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
// src
import { windowWidth } from './src/styles/variables'
// BODY

const SET_FORM = 'SET_FORM'
const RESET_STATE = 'RESET_STATE'
const SET_LOADING = 'SET_LOADING'
const formReducer = (state, action) => {
  switch (action.type) {
    case SET_FORM:
      const updatedValues = {
        ...state.inputValues,
        [action.input]: action.value,
      }

      let updatedValidities = state.inputValidities
      if (action.input === 'firstName' || action.input === 'lastName' || action.input === 'birthDate') {
        updatedValidities = {
          ...state.inputValidities,
          [action.input]: action.isValid,
        }
      }

      let updatedFormIsValid = true
      for (const key in updatedValidities) {
        updatedFormIsValid = updatedFormIsValid && updatedValidities[key]
      }

      return {
        inputValues: updatedValues,
        inputValidities: updatedValidities,
        formIsValid: updatedFormIsValid,
      }

    case RESET_STATE:
      return {
        inputValues: {
          lastName: '',
          firstName: '',
          thirdName: '',
          birthDate: '',
          gender: undefined,
          status: 0,
          sms: false,
        },
        inputValidities: {
          lastName: true,
          firstName: true,
          thirdName: true,
          birthDate: true,
        },
        formIsValid: false,
      }

    case SET_LOADING:
      return {
        ...state,
        loading: action.loading,
      }

    default:
      return state
  }
}

export default function App() {
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      lastName: 'Ivanov',
      firstName: 'Ivan',
      thirdName: '',
      birthDate: '',
      gender: undefined,
      status: 0,
      sms: false,
    },
    inputValidities: {
      lastName: true,
      firstName: true,
      birthDate: false,
    },
    formIsValid: false,
    loading: false,
  })

  const { firstName, lastName, thirdName, birthDate, gender, status, sms } = formState.inputValues
  const { firstName: firstNameValid, lastName: lastNameValid, birthDate: birthDateValid } = formState.inputValidities

  function inputChangeHandler(inputIdentifier, inputValue) {
    let isValid = false

    // Validate lastName & firstName
    if (inputIdentifier === 'lastName' || inputIdentifier === 'firstName') {
      if (inputValue.length !== 0 && inputValue.length < 101) {
        isValid = true
      }
    }

    // Validate thirdName
    if (inputIdentifier === 'thirdName') {
      if (inputValue.length !== 0 && inputValue.length < 101) {
        isValid = true
      } else {
        isValid = false
      }
    }

    // validate birthdate
    if (inputIdentifier === 'birthDate' && Date.parse(inputValue) < Date.parse(new Date()) - 1000 * 60 * 60 * 24) {
      isValid = true
    }

    dispatchFormState({
      type: SET_FORM,
      input: inputIdentifier,
      value: inputValue,
      isValid,
    })
  }

  function nameFilterHandler(inputIdentifier, text) {
    text = text.toString().trim().replace(/\d/g, '')
    inputChangeHandler(inputIdentifier, text)
  }

  // console.log(formState)

  // DatePicker -->
  function onChange(event, selectedDate) {
    const currentDate = selectedDate.toISOString()
    inputChangeHandler('birthDate', currentDate)
  }
  function showDatepicker() {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange,
      mode: 'date',
    })
  }
  // <-- DatePicker

  async function submitHandler() {
    let body = {
      lastName,
      firstName,
      thirdName,
      birthDate: birthDate.split('T')[0],
      gender,
      status,
      sms,
    }
    try {
      dispatchFormState({ type: SET_LOADING, loading: true })
      let uri = 'https://622f121d-5f5c-452f-afa7-7787dd15f8c8.mock.pstmn.io/client'

      let headers = { 'Content-Type': 'application/json' }
      const response = await axios.post(uri, body, headers)
      console.log('response', JSON.stringify(response, null, 4))

      dispatchFormState({ type: RESET_STATE })
      dispatchFormState({ type: SET_LOADING, loading: false })
    } catch (error) {
      console.log(error)
      dispatchFormState({ type: SET_LOADING, loading: false })
    }
  }

  // console.log(formState.inputValues)

  return (
    <ScrollView>
      <View style={styles.center}>
        {/* Last Name */}
        <View style={styles.wrapper}>
          <TextInput
            label={lastNameValid ? 'Фамилия *' : 'Необходимо ввести фамилию'}
            error={!lastNameValid}
            onBlur={() => inputChangeHandler('lastName', lastName)}
            mode="outlined"
            onChangeText={nameFilterHandler.bind(this, 'lastName')}
            value={() => lastName}
            returnKeyType="next"
          />
        </View>
        {/* First Name */}
        <View style={styles.wrapper}>
          <TextInput
            label={firstNameValid ? 'Имя *' : 'Необходимо ввести имя'}
            error={!firstNameValid}
            onBlur={() => inputChangeHandler('firstName', firstName)}
            mode="outlined"
            onChangeText={nameFilterHandler.bind(this, 'firstName')}
            value={() => firstName}
            returnKeyType="next"
          />
        </View>
        {/* Third name */}
        <View style={styles.wrapper}>
          <TextInput
            label={'Отчество'}
            mode="outlined"
            onChangeText={nameFilterHandler.bind(this, 'thirdName')}
            value={() => thirdName}
          />
        </View>
        {/* DATE */}
        <View style={[styles.wrapper, styles.rowCenter]}>
          <Text style={styles.genderTitle}>День рождения: </Text>
          <Text style={styles.genderText}>
            {!birthDate.length ? '' : birthDateValid ? birthDate?.split('T')[0] : 'Неверная дата!'}
          </Text>
          <TouchableOpacity onPress={showDatepicker}>
            <MaterialCommunityIcons name="calendar" color={'#000'} size={25} style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
        </View>
        {/* GENDER */}
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
        {/* SELECTOR */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.genderTitle}>Группа клиентов</Text>
          <Picker
            selectedValue={formState.inputValues.status}
            onValueChange={itemValue => inputChangeHandler('status', itemValue)}>
            <Picker.Item label="-- выберите группу клиентов --" value={0} />
            <Picker.Item label="VIP" value={1} />
            <Picker.Item label="Проблемные" value={2} />
            <Picker.Item label="ОМС" value={3} />
          </Picker>
        </View>
        {/* SMS */}
        <View style={[styles.wrapper, styles.rowCenter]}>
          <Checkbox status={sms ? 'checked' : 'unchecked'} onPress={() => inputChangeHandler('sms', !sms)} />
          <Text style={styles.genderText}>Уведомления по СМС</Text>
        </View>
        {/*  BTN SEND */}
        <Button mode="contained" onPress={submitHandler} disabled={!formState.formIsValid} loading={formState.loading}>
          Зарегистрировать
        </Button>
      </View>
    </ScrollView>
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
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
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
  selectorWrapper: {
    width: windowWidth * 0.9,
    height: windowWidth * 0.15,
    marginVertical: 20,
  },
})
