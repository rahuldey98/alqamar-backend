module.exports = {
  apps : [{
    name: 'alqamar-api',
    script: 'dist/app.js',
    watch: false,
    out_file: "logs/out.log",
    error_file: "logs/error.log", 
    merge_logs: true,
    time: false
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
