require('shelljs/global');
try {
    hexo.on('deployAfter', function() { //��deploy��ɺ�ִ�б���
        run();
    });
} catch (e) {
    console.log("������һ������<(��3��)> !����������Ϊ��" + e.toString());
}

function run() {
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    } else {
        echo("======================Auto Backup Begin===========================");
        cd('H:\graduation\Blog'); //�˴��޸�ΪHexo��Ŀ¼·��
        if (exec('git add --all').code !== 0) {
            echo('Error: Git add failed');
            exit(1);
        }
        if (exec('git commit -am "Form auto backup script\'s commit"').code !== 0) {
            echo('Error: Git commit failed');
            exit(1);
        }
        if (exec('git push origin master').code !== 0) {
            echo('Error: Git push failed');
            exit(1);
        }
        echo("==================Auto Backup Complete============================")
    }
}