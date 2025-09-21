import React, { useState, useEffect } from 'react';
import {
  Content,
  Header,
  Page,
  ContentHeader,
  ErrorPage,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { githubAccessApiRef } from '../../apis';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
// import { Octokit } from '@octokit/rest';

interface GroupEntity extends Entity {
  spec: {
    type: string;
    children?: string[];
    profile?: {
      displayName?: string;
    };
  };
}

interface FormData {
  githubIdentity: string;
  project: string;
  accessType: string;
  repoUrl: string;
}

const useStyles = makeStyles(theme => ({
  form: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(2),
  },
  progress: {
    marginLeft: theme.spacing(1),
  },
}));

export const GithubAccessPage = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [allGroups, setAllGroups] = useState<GroupEntity[]>([]);
  const [parentGroups, setParentGroups] = useState<GroupEntity[]>([]);
  const [childProjects, setChildProjects] = useState<string[]>([]);
  const [selectedParentGroup, setSelectedParentGroup] = useState<string>('');
  const [repos, setRepos] = useState<{ url: string; title: string }[]>([]);
  const githubAccessApi = useApi(githubAccessApiRef);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    githubIdentity: '',
    project: '',
    accessType: '',
    repoUrl: '',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await catalogApi.getEntities({
          filter: [{
            kind: 'Group',
          }],
        });
        const all = response.items.filter((group): group is GroupEntity =>
          group.kind === 'Group'
        );
        setAllGroups(all);
        const parents = all.filter(group =>
          ['internal', 'external'].includes(group.metadata.name)
        );
        setParentGroups(parents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load groups';
        console.error('Error fetching groups:', err);
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, [catalogApi]);
  useEffect(() => {
    if (selectedParentGroup) {
      const group = allGroups.find(g => g.metadata.name === selectedParentGroup);
      if (group?.spec?.children) {
        setChildProjects(group.spec.children);
      } else {
        setChildProjects([]);
        console.warn(`No children found for group ${selectedParentGroup}`);
      }
      setFormData(prev => ({ ...prev, project: '', repoUrl: '' }));
    } else {
      setChildProjects([]);
      setFormData(prev => ({ ...prev, project: '', repoUrl: '' }));
    }
  }, [selectedParentGroup, allGroups]);

  useEffect(() => {
    if (formData.project) {
      console.log('Selected project:', formData.project);
      const group = allGroups.find(g => g.metadata.name === formData.project);
      console.log('Selected project group:', allGroups);
      if (group?.metadata.links) {
        const sourceCodeLinks = group.metadata.links
          .filter(link => link.type === 'source-code')
          .map(link => ({ url: link.url, title: link.title || link.url }));
        setRepos(sourceCodeLinks);
      } else {
        setRepos([]);
      }
      setFormData(prev => ({ ...prev, repoUrl: '' }));
    } else {
      setRepos([]);
      setFormData(prev => ({ ...prev, repoUrl: '' }));
    }
  }, [formData.project, allGroups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use the backend API instead of direct GitHub calls
      await githubAccessApi.grantAccess({
        githubIdentity: formData.githubIdentity,
        project: formData.project,
        repoUrl: formData.repoUrl,
        accessType: formData.accessType,
      });

      setSnackbar({
        open: true,
        message: 'Access request submitted successfully!',
        severity: 'success',
      });
      setFormData({ githubIdentity: '', project: '', accessType: '', repoUrl: '' });
      setSelectedParentGroup('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      console.error('Error submitting access request:', error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }

  };

  if (error) {
    return <ErrorPage status="error" statusMessage={error} />;
  }

  return (
    <Page themeId="tool">
      <Header title="RGT GitHub Access Management" />
      <Content>
        <ContentHeader title="Request Repository Access" />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit} className={classes.form}>
                  <FormControl className={classes.formControl}>
                    <TextField
                      label="GitHub Username or Email"
                      value={formData.githubIdentity}
                      onChange={e =>
                        setFormData({ ...formData, githubIdentity: e.target.value })
                      }
                      required
                      fullWidth
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabel>Project Group</InputLabel>
                    <Select
                      value={selectedParentGroup}
                      onChange={e => {
                        setSelectedParentGroup(e.target.value as string);
                      }}
                      required
                      disabled={isLoading}
                    >
                      {parentGroups.map(group => (
                        <MenuItem key={group.metadata.name} value={group.metadata.name}>
                          {group.metadata.name.charAt(0).toUpperCase() + group.metadata.name.slice(1)} Projects
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedParentGroup && (
                    <FormControl className={classes.formControl}>
                      <InputLabel>Project</InputLabel>
                      <Select
                        value={formData.project}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            project: e.target.value as string,
                          })
                        }
                        required
                        disabled={isLoading}
                      >
                        {childProjects.length > 0 ? (
                          childProjects.map((child: string) => (
                            <MenuItem key={child} value={child}>
                              {child}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No projects available</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  )}
                  {formData.project && (
                    <>
                      <FormControl className={classes.formControl}>
                        <InputLabel>Repository</InputLabel>
                        <Select
                          value={formData.repoUrl}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              repoUrl: e.target.value as string,
                            })
                          }
                          required
                          disabled={isLoading}
                        >
                          {repos.length > 0 ? (
                            repos.map(repo => (
                              <MenuItem key={repo.url} value={repo.url}>
                                {repo.title}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No repositories available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      {formData.repoUrl && (
                        <FormControl className={classes.formControl}>
                          <TextField
                            label="Selected Repository URL"
                            value={formData.repoUrl}
                            fullWidth
                            disabled
                          />
                        </FormControl>
                      )}
                    </>
                  )}
                  <FormControl className={classes.formControl}>
                    <InputLabel>Access Type</InputLabel>
                    <Select
                      value={formData.accessType}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          accessType: e.target.value as string,
                        })
                      }
                      required
                      disabled={isLoading}
                    >
                      <MenuItem value="pull">Read</MenuItem>
                      <MenuItem value="push">Write</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        Submitting
                        <CircularProgress size={20} className={classes.progress} />
                      </>
                    ) : (
                      'Request Access'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Content>
    </Page>
  );
};