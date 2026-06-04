pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        CYPRESS_CACHE_FOLDER = '.cache/Cypress'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Set Test Environment') {
            steps {
                script {
                    switch (env.BRANCH_NAME) {
                        case 'staging':
                            env.APP_ENV = 'staging'
                            break
                        case 'main':
                            env.APP_ENV = 'prod'
                            break
                        default:
                            error("Unsupported branch: ${env.BRANCH_NAME}")
                    }

                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Test Environment: ${env.APP_ENV}"
                }
            }
        }

        stage('Run Cypress Tests') {
            parallel {
                stage('Chrome Tests') {
                    steps {
                        sh "npx cypress run --browser chrome --env APP_ENV=${APP_ENV}"
                    }
                }

//                 stage('Firefox Tests') {
//                     steps {
//                         sh "npx cypress run --browser firefox --env APP_ENV=${APP_ENV}"
//                     }
//                 }
//
//                 stage('Edge Tests') {
//                     steps {
//                         sh "npx cypress run --browser edge --env APP_ENV=${APP_ENV}"
//                     }
//                 }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            junit 'reports/**/*.xml'
        }

        success {
            echo "Cypress tests passed in ${env.APP_ENV} environment"
        }

        failure {
            echo "Cypress tests failed in ${env.APP_ENV} environment"
        }
    }
}