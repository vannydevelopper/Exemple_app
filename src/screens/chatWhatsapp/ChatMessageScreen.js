import React, { useEffect, memo, useState } from "react";
import { Text, View, StyleSheet, TouchableNativeFeedback, AppState, Image, TextInput, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS } from "../../styles/COLORS";
import { useRef } from "react";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import io from 'socket.io-client'
import fetchApi, { API_URL } from "../../helpers/fetchApi";
import moment from "moment";


const Message = memo(({ messages, message, index }) => {
        const showDate = index == messages.length - 1 ? true : moment(messages[index + 1].DATE_INSERTION).date() != moment(message.DATE_INSERTION).date()
        const isRider = !message.IS_DRIVER
        const isSameFromFirst = index == messages.length - 1 ? false : (isRider ? messages[index + 1].ID_RESTO == isRider : !messages[index + 1].ID_RESTO)
        /* const isSameFromMiddle = */
        const isSameFromLast = index == 0 ? false : (isRider ? messages[index - 1].ID_RESTO == isRider : !messages[index - 1].ID_RESTO)
        const isLastFromClient = index == messages.length - 1 ? true : !message.ID_RESTO && messages[index + 1].ID_RESTO
        return (
                <>
                        <View style={{ ...styles.messageContainer, justifyContent: isRider ? 'flex-start' : 'flex-end', marginBottom: index == 0 ? 10 : 0 }}>
                                <View style={styles.message}>
                                        <View style={{
                                                ...styles.messageBody,
                                                marginTop: isLastFromClient ? 10 : 3,
                                                backgroundColor: isRider ? '#D3D3D3' : COLORS.primary,
                                                // borderBottomRightRadius: isSameFromLast && !isRider ? 5 : 20,
                                                // borderBottomLeftRadius: isSameFromLast && isRider ? 5 : 20,
                                                // borderTopRightRadius: isSameFromFirst && !isRider ? 5 : 20,
                                                // borderTopLeftRadius: isSameFromFirst && isRider ? 5 : 20
                                        }}>
                                                <Text style={{ ...styles.messageText, color: isRider ? '#000' : '#fff' }}>
                                                        {message.MESSAGE}
                                                </Text>
                                                <Text style={{ color: isRider ? '#000' : '#fff', opacity: 0.6, fontSize: 11, textAlign: isRider ? 'left' : 'right' }}>{moment(message.DATE_INSERTION).format('H:mm')}</Text>
                                        </View>
                                </View>
                        </View>
                        {showDate ? <Text style={styles.messageDate}>{moment(message.DATE_INSERTION).format('DD-MM-YYYY')}</Text> : null}
                </>
        )
})

const DEFAULT_MESSAGES = [
        "Bonjour, je suis votre chauffeur. Je voulais juste confirmer que vous souhaitez réellement effectuer une course avec nous. Pouvez-vous me le confirmer s'il vous plaît ?",
        "J'ai bien reçu votre demande de course. Je me dirige vers votre emplacement. Est-ce que tout est prêt de votre côté ?",
        "Bonjour ! Pouvez-vous confirmer si vous souhaitez réellement effectuer la course demandée ?",
]
const LIMIT = 30

export default function ChatMessageScreen() {
        const navigation = useNavigation()
        const flatlistRef = useRef()
        const inputRef = useRef(null)
        const [loading, setLoading] = useState(true)
        const user = useSelector(userSelector)
        const [messageBody, setMessageBody] = useState('')
        const [messages, setMessages] = useState([])
        const [isLoadingMore, setIsLoadingMore] = useState(false)
        const [offset, setOffset] = useState(0)

        const socket = useRef(io(API_URL)).current

        const handleAppStateChange = (newState) => {
                if (newState == 'active') {
                        setOffset(0)
                        fetchMessages()
                }
        };

        const getMessages = async (ofs = 0) => {
                try {
                        const ms = await fetchApi(`/message/drivers/message/${user.ID_DRIVER}?offset=${ofs}&limit=${LIMIT}`)
                        return ms.result.data
                } catch (error) {
                        throw error
                }
        }
        const fetchMessages = async () => {
                try {
                        const ms = await getMessages()
                        setMessages(ms)
                } catch (error) {
                        console.log(error)
                } finally {
                        setLoading(false)
                }
        }

        const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }) => {
                const paddingToBottom = 20;
                return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }, []);

        const loadMore = async () => {
                setIsLoadingMore(true)
                const newOffet = offset + LIMIT
                setOffset(newOffet)
                const ms = await getMessages(newOffet)
                setMessages(ms)
                setIsLoadingMore(false)
        }


        const onSendMesssage = async () => {
                try {

                        const message = {
                                MESSAGE: messageBody,
                                IS_DRIVER: 1,
                                DATE_INSERTION: new Date()
                        }
                        setMessages(messages => [message, ...messages])
                        if (flatlistRef.current) flatlistRef.current.scrollToIndex({ index: 0, animating: true });
                        await fetchApi(`/message/drivers`, {
                                method: 'POST',
                                body: JSON.stringify({
                                        MESSAGE: messageBody
                                }),
                                headers: {
                                        'Content-Type': 'application/json'
                                }
                        })
                        setMessageBody('')

                } catch (error) {
                        console.log(error)
                }
        }
        useEffect(() => {
                socket.on('connect', (err, data) => {
                        socket.emit('join', { userId: `d_${user.ID_DRIVER}`, userType: 'driver' });
                })
                socket.on('MESSAGE_ENVOYER', (message) => {
                        if (message) {
                                const newMessage = {
                                        MESSAGE: message,
                                        DATE_INSERTION: new Date()
                                }
                                setMessages(messages => [newMessage, ...messages])
                        }
                })
                socket.on('error', error => {
                        console.log(error)
                })
                socket.on('disconnect', () => {
                        isSocketConnected = false;
                });
                return () => {
                        socket.disconnect()
                }
        }, [socket])
        useFocusEffect(useCallback(() => {
                (async () => {
                        fetchMessages()
                        const subscription = AppState.addEventListener('change', handleAppStateChange);
                        return () => {
                                subscription.remove()
                        };
                })()
        }, []))

        useFocusEffect(useCallback(() => {
                (async () => {
                        try {
                                await fetchApi(`/message/drivers/message`, {
                                        method: 'PUT',
                                        headers: {
                                                'Content-Type': 'application/json'
                                        }
                                })
                        } catch (error) {
                                throw error
                        }
                })()
        }, []))

        return (
                <>
                        <View style={styles.container}>
                                <View style={styles.header}>
                                        <View style={styles.leftSide}>
                                                <TouchableNativeFeedback onPress={() => navigation.goBack()} background={TouchableNativeFeedback.Ripple('#C4C4C4', true)}>
                                                        <View style={styles.headerBtn}>
                                                                <Ionicons name="chevron-back" size={24} color="black" />
                                                        </View>
                                                </TouchableNativeFeedback>
                                                <View style={styles.user}>
                                                        <View style={styles.imageContainer}>
                                                                {/* {conversation.IMAGE ? <Image source={{ uri: conversation.IMAGE }} style={styles.image} /> : */}
                                                                <Image source={require('../../../assets/icon.png')} style={styles.image} />
                                                                {/* } */}
                                                        </View>
                                                        <View style={styles.namesTel}>
                                                                <Text style={styles.names}>Wasili</Text>
                                                                <Text style={styles.tel}>CAPTAIN</Text>
                                                        </View>
                                                </View>
                                        </View>
                                        <View style={styles.conversationActions}>
                                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#C4C4C4', true)}>
                                                        <View style={styles.headerBtn}>
                                                                <Ionicons name="call-outline" size={26} color={'#777'} />
                                                        </View>
                                                </TouchableNativeFeedback>
                                        </View>
                                </View>
                                <View style={styles.messagesContent}>
                                        {messages.length > 0 ? <FlatList
                                                showsVerticalScrollIndicator={false}
                                                ref={flatlistRef}
                                                inverted
                                                onScroll={({ nativeEvent }) => {
                                                        if (isCloseToBottom(nativeEvent) && !isLoadingMore) {
                                                                loadMore()
                                                        }
                                                }}
                                                scrollEventThrottle={400}
                                                data={messages}
                                                keyExtractor={(item, index) => index.toString()}
                                                ListFooterComponent={() => <ActivityIndicator animating size={'small'} color={'#000'} style={{ marginVertical: 10, opacity: isLoadingMore ? 1 : 0 }} />}
                                                // ListHeaderComponent={() => isRiderTyping ? <View style={styles.typingContent}>
                                                //         <LottieView style={{ width: 50, height: 50 }} source={require('../../../assets/lotties/typing.json')} autoPlay loop speed={1.5} />
                                                // </View> : null}
                                                renderItem={({ item, index }) => <Message message={item} index={index} messages={messages} />}
                                        /> :
                                                <View style={styles.emptyMessageContainer}>
                                                        {DEFAULT_MESSAGES.map((message, index) => {
                                                                return (
                                                                        <TouchableNativeFeedback useForeground onPress={() => {
                                                                                setMessageBody(message)
                                                                                inputRef.current.focus()
                                                                        }} key={index}>
                                                                                <View style={styles.defaultMessage}>
                                                                                        <Text style={styles.defaultMessageContent}>
                                                                                                {message}
                                                                                        </Text>
                                                                                </View>
                                                                        </TouchableNativeFeedback>
                                                                )
                                                        })}
                                                </View>
                                        }
                                </View>
                                <View style={styles.form}>
                                        <TextInput placeholder='Ecrire le message' ref={inputRef} style={styles.input} value={messageBody.toString()} multiline onChangeText={newText => setMessageBody(newText)} />
                                        <TouchableNativeFeedback onPress={onSendMesssage} background={TouchableNativeFeedback.Ripple('#C4C4C4', true)} disabled={messageBody.trim() == ''}>
                                                <View style={[styles.sendBtn, { opacity: messageBody.trim() == '' ? 0.5 : 1 }]}>
                                                        <Ionicons name="ios-send" size={24} color={COLORS.primary} />
                                                </View>
                                        </TouchableNativeFeedback>
                                </View>
                        </View>
                </>
        )
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: "#fff"
        },
        form: {
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                paddingVertical: 10,
        },
        input: {
                backgroundColor: '#f1f1f1',
                borderRadius: 10,
                padding: 10,
                flex: 1,
                marginLeft: 20,
                maxHeight: 120
        },
        sendBtn: {
                paddingHorizontal: 20,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
        },
        messagesContent: {
                flex: 1,
                backgroundColor: '#f1f1f1'
        },
        emptyMessageContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20
        },
        defaultMessage: {
                backgroundColor: '#fff',
                borderRadius: 10,
                marginTop: 10,
                padding: 10,
                width: '100%',
                maxWidth: 400,
                textAlign: 'center',
                overflow: 'hidden'
        },
        defaultMessageContent: {
                lineHeight: 21,
                fontWeight: '400',
                fontSize: 14,
                color: '#777'
        },
        header: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 20
        },
        headerBtn: {
                padding: 10
        },
        leftSide: {
                flexDirection: 'row',
                alignItems: 'center'
        },
        user: {
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 10
        },
        imageContainer: {
                width: 50,
                height: 50,
                backgroundColor: COLORS.handleColor,
                borderRadius: 50,
                padding: 2
        },
        image: {
                width: "100%",
                height: "100%",
                borderRadius: 50,
                resizeMode: "contain"
        },
        namesTel: {
                marginLeft: 10
        },
        names: {
                fontWeight: 'bold'
        },
        tel: {
                fontSize: 12,
                color: '#777',
                marginTop: 2
        },
        conversationActions: {
                paddingHorizontal: 10
        },
        messageContainer: {
                width: '100%',
                flex: 1,
                flexDirection: 'row',
                paddingHorizontal: 10,
                marginTop: 5
        },
        message: {
                maxWidth: '80%',
        },
        messageBody: {
                borderRadius: 15,
                padding: 10,
        },
        messageDate: {
                textAlign: 'center',
                color: '#fff',
                fontSize: 12,
                backgroundColor: '#3d3c3c42',
                borderRadius: 30,
                alignSelf: 'center',
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontWeight: 'bold',
                marginVertical: 20
        },
        messageText: {
                fontWeight: '400',
                fontSize: 13.5
        },
})