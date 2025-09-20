import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  img: {
    width: 'auto',
    height: 28,
    marginLeft: 0,
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <img
      className={classes.img}
      src="/really_great_tech_logo.jpeg"
      alt="Really Great Tech"
    />
  );
};

export default LogoIcon;

