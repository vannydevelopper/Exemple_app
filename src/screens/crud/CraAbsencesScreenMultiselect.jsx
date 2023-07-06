import React, { useEffect, useState, useRef, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Button, Icon, Input, NativeBaseProvider, TextArea, useToast } from 'native-base';
import { AntDesign, Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { primaryColor } from '../Welcome/styles';
import { fetchApi } from '../../functions';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import Skeleton from '../Skeleton/Skeleton';
import { useSelector } from 'react-redux';
import { userSelector } from '../../store/selectors/userSelector';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export const Skeletons = () => {
        const fakeElements = []
        for (let i = 1; i <= 20; i++) {
                fakeElements.push(i)
        }
        return (
                <View style={{ alignItems: "center", paddingTop: 15 }}>
                        {fakeElements.map((fe, i) => <View key={i.toString()} style={{ backgroundColor: '#e8e7e7', padding: 10, width: '100%', borderRadius: 10, flexDirection: 'row', marginTop: i > 0 ? 10 : 0 }}>
                                <Skeleton style={{ width: 30, height: 30, borderRadius: 50, backgroundColor: '#fff' }} />
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Skeleton style={{ flex: 1, height: 20, borderRadius: 2, backgroundColor: '#fff' }} />
                                        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5 }}>
                                                <Skeleton style={{ width: '30%', height: 10, borderRadius: 2, backgroundColor: '#fff' }} />
                                                <Skeleton style={{ width: '30%', height: 10, borderRadius: 2, backgroundColor: '#fff' }} />
                                        </View>
                                </View>
                        </View>)}
                </View>
        )
}

export default function GestionAbsenceScreen() {
        const toast = useToast()
        const navigation = useNavigation()
        const [motif, setMotif] = useState('')
        const [loading, setLoading] = useState(false)
        const user = useSelector(userSelector)

        // dateDebut datePicker
        const [dateDebut, setDateDebut] = useState(new Date());
        const [showDateDebut, setShowDateDebut] = useState(false);
        const onChangeDateDebut = (event, selectedDate) => {
                const currentDate = selectedDate || dateDebut;
                setShowDateDebut(Platform.OS === "ios");
                setDateDebut(currentDate);
        };

        // Responsable select
        const responsableModalizeRef = useRef(null);
        const [responsable, setResponsable] = useState(null);
        const openResponsableModalize = () => {
                responsableModalizeRef.current?.open();
        };
        const setSelectedResponsable = (project) => {
                responsableModalizeRef.current?.close();
                setResponsable(project)
        }

        // Leader select
        const leaderModalizeRef = useRef(null);
        const [oneLidear, setOneLidear] = useState([])
        const openLeadersModalize = () => {
                leaderModalizeRef.current?.open();
        };
        // const setSelectedLeader = (project) => {
        //         // leaderModalizeRef.current?.close();
        //         setLeaders(project)
        // }

        // Status select
        const statusModalizeRef = useRef(null);
        const [status, setStatus] = useState(null);
        const openStatusModalize = () => {
                statusModalizeRef.current?.open();
        };
        const setSelectedStatus = (project) => {
                statusModalizeRef.current?.close();
                setStatus(project)
        }

        const ResponsableList = () => {
                const [projects, setProjects] = useState([])
                const [loadingProjets, setLoadingProjets] = useState(true)
                const [searchProject, setSearchProject] = useState('')
                const [filtered, setFiltered] = useState([])
                const componentMounted = useRef(true)

                useEffect(() => {
                        (async function () {
                                const projets = await fetchApi('/responsable_get');
                                if (componentMounted.current) {
                                        setLoadingProjets(false)
                                        setProjects(projets)
                                }
                        })()
                        return () => {
                                componentMounted.current = false;
                        }
                }, [])
                useEffect(() => {
                        if (searchProject != '') {
                                const filtered = projects.filter(project => {
                                        return project.label.toLowerCase().includes(searchProject.toLowerCase())
                                })
                                setFiltered(filtered)
                        }
                }, [searchProject])
                const itemsToShow = searchProject == '' ? projects : filtered
                return (
                        <View style={styles.modalContent}>
                                <View>
                                        <Input value={searchProject} onChangeText={(value) => setSearchProject(value)} mt={2} placeholder="Chercher..." size='lg' py={2} InputLeftElement={
                                                <Icon
                                                        as={<Feather name="search" size={24} color="black" />}
                                                        size={5}
                                                        ml="2"
                                                        color="muted.400"
                                                />}
                                        />
                                </View>
                                <View style={styles.modalList}>
                                        {loadingProjets ? <Skeletons /> :
                                                itemsToShow.map(project => {
                                                        return <TouchableOpacity onPress={() => setSelectedResponsable(project)} style={styles.modalItem} key={project.value}>
                                                                {/* <FontAwesome name="dot-circle-o" size={20} color="#777" /> */}
                                                                <Text numberOfLines={1} style={styles.modalText}>{project.label} {project.Prenom}</Text>
                                                        </TouchableOpacity>
                                                })}
                                </View>
                        </View>
                )

        }

        const StatusList = () => {
                const [allStatus, setAllStatus] = useState([])
                const [loadingStatus, setLoadingStatus] = useState(true)
                const [searchStatus, setSearchStatus] = useState('')
                const [filtered, setFiltered] = useState([])
                const componentMounted = useRef(true)

                useEffect(() => {
                        (async function () {
                                const projets = await fetchApi('/status_get');
                                if (componentMounted.current) {
                                        setLoadingStatus(false)
                                        setAllStatus(projets)
                                }
                        })()
                        return () => {
                                componentMounted.current = false;
                        }
                }, [])

                return (
                        <View style={styles.modalContent}>
                                <View style={styles.modalList}>
                                        {loadingStatus ? <Skeletons /> :
                                                allStatus.map(project => {
                                                        return <TouchableOpacity onPress={() => setSelectedStatus(project)} style={styles.modalItem} key={project.value}>
                                                                {/* <FontAwesome name="dot-circle-o" size={20} color="#777" /> */}
                                                                <Text numberOfLines={1} style={styles.modalText}>{project.label}</Text>
                                                        </TouchableOpacity>
                                                })}
                                </View>
                        </View>
                )
        }

        const LeaderList = () => {
                const [search, setSearch] = useState('')
                const [projects, setProjects] = useState([])
                const [loadingProjets, setLoadingProjets] = useState(true)
               
                const submitCollaborateur = () => {
                        leaderModalizeRef.current?.close();
                }

                const isSelected = id_ledear => oneLidear.find(u => u.value == id_ledear) ? true : false
                const setSelectedLeader = (project) => {
                        if (isSelected(project.value)) {
                                const newusers = oneLidear.filter(u => u.value != project.value)
                                setOneLidear(newusers)
                            } else {
                                setOneLidear(u => [...u, project])
                            }
                       
                }

                useFocusEffect(useCallback(() => {
                        (async () => {
                                try {
                                        var url = `/absence/responsable`
                                        if (search) {
                                                url += `?q=${search}`
                                        }
                                        const leade = await fetchApi(url)
                                        setProjects(leade)
                                }
                                catch (error) {
                                        console.log(error)
                                } finally {
                                        setLoadingProjets(false)
                                }
                        })()
                }, [search]))

                return (
                        <View style={styles.modalContent}>
                                <View>
                                        <Input value={search} onChangeText={(value) => setSearch(value)} mt={2} placeholder="Chercher..." size='lg' py={2} InputLeftElement={
                                                <Icon
                                                        as={<Feather name="search" size={24} color="black" />}
                                                        size={5}
                                                        ml="2"
                                                        color="muted.400"
                                                />}
                                        />
                                </View>
                                <View style={styles.modalList}>
                                        {loadingProjets ? <Skeletons /> :
                                                projects.map((project, index) => {
                                                        return (
                                                                <TouchableOpacity onPress={() => setSelectedLeader(project)} style={styles.modalItem} key={index}>
                                                                        {isSelected(project.value) ? <MaterialIcons name="check-box" size={24} color="#007bff" /> :
                                                                                <MaterialIcons name="check-box-outline-blank" size={24} color="black" />}
                                                                        <Text numberOfLines={1} style={styles.modalText}>{project.label} {project.Prenom}</Text>
                                                                </TouchableOpacity>
                                                        )
                                                })}
                                </View>
                                <View style={styles.actions}>
                                        <Button
                                                onPress={submitCollaborateur}
                                                size='lg' w="full" mt={10}
                                                style={styles.login} py={4} backgroundColor={primaryColor} _text={{ fontSize: 18 }} borderRadius={10}
                                        >Confirmer</Button>
                                </View>
                        </View>
                )

        }

        const isValid = status && status != ''

        const submitAbsence = async () => {
                console.log("hello")
                setLoading(true)
                try {
                        const absenceData = {
                                IDEmploye: user.collaboId,
                                selectedColl: JSON.stringify(oneLidear),
                                ID_STATUT_ABSCENCE: status.value,
                                DATE_DECLARATION: (moment(dateDebut).format('YYYY/MM/DD HH:mm:ss')),
                                userid: user.userid,
                                MOTIF: motif,
                        }
                        console.log(absenceData)
                        const newAbsence = await fetchApi('/absences/add', {
                                method: 'POST',
                                body: JSON.stringify(absenceData),
                                headers: {
                                        'Content-Type': 'application/json'
                                }
                        });
                        setLoading(false)
                        navigation.goBack()
                        toast.show({
                                title: "Une nouvelle absence est faite avec réussi",
                                placement: "bottom",
                                status: 'success',
                                duration: 2000
                        })
                }
                catch (error) {
                        console.log(error)
                        setLoading(false)
                        toast.show({
                                title: "Une nouvelle absence non ajouté",
                                placement: "bottom",
                                status: 'error',
                                duration: 2000
                        })
                }
        }


        return (
                <NativeBaseProvider>
                        <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>
                                <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center' }}>
                                        <Text style={styles.label}>Collaborateur</Text>
                                </View>
                                {(user && user.USER_PROFILE_ID == 1) ? <TouchableOpacity onPress={openResponsableModalize} style={styles.openModalize}>
                                        <Text style={styles.openModalizeLabel} numberOfLines={1}>{responsable ? `${responsable.label} ${responsable.Prenom}` : 'Selectionner un responsable'}</Text>
                                        <AntDesign name="caretdown" size={16} color="#777" />
                                </TouchableOpacity> :
                                        <View onPress={openResponsableModalize} style={styles.openModalize}>
                                                <Text style={styles.openModalizeLabel} numberOfLines={1}>{user.fname} {user.lname}</Text>
                                                <AntDesign name="caretdown" size={16} color="#777" />
                                        </View>
                                }
                                <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center' }}>
                                        <Text style={styles.label}>Responsable</Text>
                                </View>
                                <TouchableOpacity onPress={openLeadersModalize} style={styles.openModalize}>
                                        <Text style={styles.openModalizeLabel} numberOfLines={1}>{ oneLidear.length > 0 ? oneLidear.length : 'Selectionner le status'}</Text>
                                        <AntDesign name="caretdown" size={16} color="#777" />
                                </TouchableOpacity>

                                <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center' }}>
                                        <Text style={styles.label}>Types d'absences</Text>
                                </View>
                                <TouchableOpacity onPress={openStatusModalize} style={styles.openModalize}>
                                        <Text style={styles.openModalizeLabel} numberOfLines={1}>{status ? status.label : 'Selectionner le status'}</Text>
                                        <AntDesign name="caretdown" size={16} color="#777" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDateDebut(true)}>
                                        <View style={styles.iconDebutName}>
                                                <MaterialIcons name="calendar-today" size={24} color="#777" style={styles.icon} />
                                                <Text style={styles.debutName}>Date declaration</Text>
                                        </View>
                                        <View style={styles.rightDate}>
                                                <Text style={styles.rightDateText}>{`${dateDebut.getDate()}/${dateDebut.getMonth() + 1}/${dateDebut.getFullYear()}`}</Text>
                                        </View>
                                </TouchableOpacity>
                                {showDateDebut && (
                                        <DateTimePicker
                                                testID="dateTimePicker"
                                                value={dateDebut}
                                                mode='date'
                                                is24Hour={true}
                                                display="default"
                                                onChange={onChangeDateDebut}
                                                minimumDate={new Date()}
                                        />
                                )}

                                <Input multiline value={motif} onChangeText={(value) => setMotif(value)} mt={2} placeholder="Motif" size='lg' py={2} InputLeftElement={
                                        <Icon
                                                as={<MaterialCommunityIcons name="comment-outline" size={24} color="black" />}
                                                size={5}
                                                ml="2"
                                                color="muted.400"
                                        />}
                                />
                                <View style={styles.actions}>
                                        <Button
                                                isDisabled={!isValid}
                                                isLoading={loading}
                                                onPress={submitAbsence}
                                                size='lg' w="full" mt={10}
                                                style={styles.login} py={4} backgroundColor={primaryColor} _text={{ fontSize: 18 }} borderRadius={10}
                                        >Enregistrer</Button>
                                </View>
                        </ScrollView>
                        <Portal>
                                <Modalize ref={responsableModalizeRef}  >
                                        <ResponsableList />
                                </Modalize>
                        </Portal>
                        <Portal>
                                <Modalize ref={statusModalizeRef}>
                                        <StatusList />
                                </Modalize>
                        </Portal>
                        <Portal>
                                <Modalize ref={leaderModalizeRef}>
                                        <LeaderList />
                                </Modalize>
                        </Portal>
                </NativeBaseProvider>

        )
}

const styles = StyleSheet.create({
        label: {
                fontSize: 16,
                fontWeight: 'bold'
        },
        container: {
                padding: 15,
                backgroundColor: '#fff',
                height: "100%",
        },
        openModalize: {
                backgroundColor: '#dde1ed',
                padding: 10,
                borderRadius: 5,
                marginTop: 5,
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between'
        },
        openModalizeLabel: {
                color: '#555',
                fontSize: 14,
        },
        datePickerButton: {
                padding: 5,
                borderWidth: 1,
                borderColor: '#f1f1f1',
                marginTop: 10,
                borderRadius: 5,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-between'
        },
        iconDebutName: {
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center'
        },
        icon: {
                marginLeft: 2
        },
        debutName: {
                color: '#000',
                fontSize: 16,
                marginLeft: 5,
                opacity: 0.4
        },
        rightDate: {
                backgroundColor: '#F2F5FE',
                borderRadius: 10,
                padding: 5,
        },
        rightDateText: {
                opacity: 0.5
        },
        actions: {
                paddingBottom: 30
        },
        modalContent: {
                paddingHorizontal: 10,
                paddingVertical: 15
        },
        modalList: {
                marginTop: 10,
        },
        modalItem: {
                paddingVertical: 10,
                paddingHorizontal: 5,
                marginTop: 5,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center'
        },
        modalText: {
                fontSize: 16,
                fontWeight: 'bold',
                marginLeft: 10
        },
})
