<template>
    <div>
        <heading class="mb-6">Influencer Campaigns History Monthly Report</heading>

        <div class="card">
            <form enctype="multipart/form-data" v-show="!isLoading">
                <div class="flex border-b border-40">
                    <div class="w-1/5 py-6 px-8">
                        <label for="Business Username" class="inline-block text-80 pt-2 leading-tight">
                            Business Username
                        </label>
                    </div>
                    <div class="w-1/2 rounded my-auto relative pin-t pin-l">
                        <input @keyup="usernameSearchAPI(username)" v-model="username" class="w-full form-control form-input form-input-bordered">
                        <ul  v-if="results.length && username.length" class="list-reset shadow-md max-h-screen">
                            <li v-for="result in results" @click="handleSelectedUser(result)" :key="result.id"><p class="p-2 block text-black hover:bg-grey-light cursor-pointer">
                                {{result.username}}
                            </p></li>
                        </ul>
                    </div>
                </div>

                <div class="flex border-b border-40">
                    <div class="w-1/5 py-6 px-8">
                        <label for="Campaigns Monthly Repor" class="inline-block text-80 pt-2 leading-tight">
                            Campaigns Monthly Report
                        </label>
                    </div>
                    <div class="py-6 px-8 w-1/2">
                        <input id="report" dusk="long_url" type="file"  ref="report"  placeholder="Business Report"
                               class="w-full form-control form-input form-input-bordered"  @change="setInfluencerReport($event)" multiple>
                        <div class="help-text help-text mt-2"></div>
                    </div>
                </div>

                <div class="flex border-b border-40">
                    <div class="w-1/5 py-6 px-8">
                        <label for="Month" class="inline-block text-80 pt-2 leading-tight">
                            Month
                        </label>
                    </div>
                    <div class="py-6 px-8 w-1/2">
                        <select id="month" dusk="title"  placeholder="Month"
                                class="w-full form-control form-input form-input-bordered" v-model="month">
                            <option v-for="m in 12"  >{{m}}</option>
                        </select>
                        <div class="help-text help-text mt-2"></div>
                    </div>

                    <div class="py-6 px-8 w-1/2">
                        <select id="year" dusk="title"  placeholder="Month"
                                class="w-full form-control form-input form-input-bordered" v-model="year">
                            <option v-for="y in current_year"  >{{y}}</option>
                        </select>
                        <div class="help-text help-text mt-2"></div>
                    </div>
                </div>

                <div class="flex items-center">
                    <button class="btn btn-default btn-primary inline-flex items-center relative"
                            @click="saveInfluencerReport($event)" dusk="create-button" :disabled="disabled">
                        <span class=""> Save Report</span>
                    </button>
                </div>
            </form>

            <div v-show="isLoading" class="loading w-full block text-center">
                <Loading />
            </div>
        </div>

    </div>
</template>

<script>
    import axios from "axios";
    import Vue from "vue";
    import VueSweetalert2 from 'vue-sweetalert2';
    import Loading from './Loading'
    import 'sweetalert2/dist/sweetalert2.min.css';

    Vue.use(VueSweetalert2);
    export default {
        name: 'Tools',
        components: {
            Loading
        },
        data() {
            return {
                username: '',
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                current_year: new Date().getFullYear(),
                y:2010,
                report:'',
                currentSelected: "",
                disabled:false,
                results: [],
                isLoading: false
            }
        },
        mounted() {


        },
        methods:{
            usernameSearchAPI(username) {
                let apiUrl= window.location.origin+`/nova-vendor/monthly-report/business_usernames?username=${username}`
                axios.get(apiUrl).then(({data: {usernames}}) => {
                    this.results = usernames;
                })
            },
            handleSelectedUser({ id, username }) {
                this.urrentSelected = id;
                this.username = username;
                this.results = [];
            },
            resetForm(){
                this.report= '';
                this.month= new Date().getMonth();
                this.username= '';
            },
            setInfluencerReport($event){
                this.report= this.$refs.report.files;
            },
            postData: async function (url = '', data = {}) {
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept':'application/json'
                };
                return axios.post(url, data, {
                    headers: headers
                })
            },
            saveInfluencerReport: function ($event) {
                this.isLoading = true;
                $event.preventDefault();
                this.disabled= true;
                let self= this;
                let csrf= document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                let myHeaders = new Headers();
                myHeaders.append("Accept", "application/json");
                myHeaders.append('X-CSRF-Token', csrf )


                let formdata = new FormData();

                //multiple files
              for( let i = 0; i < this.$refs.report.files.length; i++ ){
                let file = this.$refs.report.files[i];
                formdata.append('report[' + i + ']', file);
              }

                formdata.append("username", this.username);
                formdata.append("month", this.month);
                formdata.append("year", this.year);

                let requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: formdata,
                    redirect: 'follow'
                };

                fetch("/nova-vendor/campaign-history-report/save-campaign-report" , requestOptions)
                    .then(result => {

                        if (result.status !=200) {
                            this.isLoading = false;
                            result.json().then(response => {
                                let errors= response.errors;
                                let htmlErrors= "<ul>";
                                for (let err in errors){
                                    htmlErrors+= '<li>'+errors[err][0]+'</li>'
                                }
                                htmlErrors += "</ul>"
                                Vue.swal( {
                                    icon:'error',
                                    title:response.message,
                                    html: htmlErrors
                                }).then(()=>self.disabled=false)
                            })

                        }else{
                            this.isLoading = false;
                            result.json().then(response => {
                                Vue.swal({
                                    title: response.message,
                                   // html: '<small>'+response.report+'</small>',
                                    confirmButtonText: 'Ok',
                                    confirmButtonColor: '#91c18e'
                                }).then(()=>{self.disabled=false;self.resetForm()})
                            });
                        }
                    })
                    .catch(errors => {
                        console.log(errors)
                    });

            },
        },
    }
</script>

<style scoped>
    .list-reset {
        max-height: 200px;
        overflow-y: scroll;
    }
    .loading {
        padding: 50px;
    }
</style>
