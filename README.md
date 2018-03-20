# discord-bash
Outils de gestion de serveur et channel discord

# usage
<div>
    <h2>Liste des serveurs et channels</h2>
    <code>
        $ discord-bash list
    </code>
    <p>Pour lister tous les serveurs et channels</p>

    <code>
        $ discord-bash list -s serverName
    </code>
    <p>Pour lister les channels du serveur spécifié</p>
</div>
<div>
    <h2>Envoyer des messages a un ou plusieurs channels</h2>
    <code>
        $ send "servername chan1 chan2, servername2 chan1 chan2" "Hello world"
    </code>
    <code>
        $ send "servername chan1 chan2, servername2 chan1 chan2" "Hello world" -f relativePathFilename
    </code>
    <p>Rajouter l'option -f pour envoyer un fichier avec son message</p>
</div>
<div>
    <h2>Envoyer des messages de façon intéractive a des channels ou des utilisateurs</h2>
    <code>
        $ message -f relativePathFilename
    </code>
    <p>Rajouter l'option -f pour envoyer un fichier avec son message</p>
</div>
<div>
    <h2>Administrer les serveurs et les droits des utilisateurs</h2>
    <code>
        $ admin
    </code>
</div>
<div>
    <h2>Configuré un token spécifique</h2>
    <code>
        $ set-token &lsaquo;token&rsaquo;
    </code>
    <code>$ set-token -c, --no-check &lsaquo;token&rsaquo;</code>
    <p>Pour désactiver le check du token</p>
</div>
<div>
    <h2>Login</h2>
    <code>
        $ discord-bash message --login
    </code>
    <p>Utilisé l'option --login sur n'importe quel commande pour demander l'authentification email/password avant l'exécution de la commande</p>
</div>