module.exports = {
  apps : [{
    name: 'alqamar-api',
    script: 'dist/app.js',
    watch: false,
    out_file: "logs/out.log",
    error_file: "logs/error.log", 
    merge_logs: true,
    time: false,
    env: {
      PORT: 3001
    }
  }]
};
